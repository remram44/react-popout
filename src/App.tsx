import React from 'react';
import ReactDOM from 'react-dom';

function Content() {
  return <p>Content here!</p>;
}

type PoppedState = 'in' | 'waiting' | 'out';

interface AppState {
  popped: PoppedState;
}

export class App extends React.PureComponent<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      popped: 'in',
    };
  }

  popIn() {
    console.log('popIn');
    this.setState({ popped: 'in' });
  }

  popOut() {
    console.log('popOut');
    this.setState({ popped: 'waiting' });
  }

  popupOpened() {
    console.log('popupOpened');
    this.setState({ popped: 'out' });
  }

  popupClosed() {
    console.log('popupClosed');
    this.setState({ popped: 'in' });
  }

  render() {
    if (this.state.popped === 'in') {
      return (
        <>
          <Content />
          <button onClick={() => this.popOut()}>Pop out</button>
        </>
      );
    } else if (this.state.popped === 'waiting') {
      return (
        <>
          <PopupWindow
            onOpen={() => this.popupOpened()}
            onClose={() => this.popupClosed()}
          >
            <Content />
          </PopupWindow>
          <Content />
          <button onClick={() => this.popOut()}>Pop out</button>
        </>
      );
    } /* this.state.popped === 'out' */ else {
      return (
        <>
          <PopupWindow
            onOpen={() => this.popupOpened()}
            onClose={() => this.popupClosed()}
          >
            <Content />
          </PopupWindow>
          <button onClick={() => this.popIn()}>Pop in</button>
        </>
      );
    }
  }
}

interface PopupWindowProps {
  onOpen?: any;
  onClose?: any;
}

interface PopupWindowState {
  container: any;
}

class PopupWindow extends React.PureComponent<
  PopupWindowProps,
  PopupWindowState
> {
  window?: any;
  timer?: number;

  constructor(props: PopupWindowProps) {
    super(props);
    this.window = undefined;
    this.state = {
      container: undefined,
    };
  }

  componentDidMount() {
    const popupWindow = window.open('', '', 'width=800, height=500');
    if (!popupWindow) {
      return;
    }
    this.window = popupWindow;
    // Listen for close event
    if (this.props.onClose) {
      this.timer = window.setInterval(() => {
        if (!this.window || this.window.closed) {
          this.props.onClose();
        }
      }, 1000);
    }
    // Create a div for the content
    const container = this.window.document.createElement('div');
    this.window.document.body.appendChild(container);
    this.setState({
      container,
    });
    // Call the open callback
    if (this.props.onOpen) {
      this.props.onOpen();
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
    if (this.window) {
      this.window.close();
    }
  }

  render() {
    if (this.state.container) {
      return ReactDOM.createPortal(this.props.children, this.state.container);
    } else {
      return null;
    }
  }
}
