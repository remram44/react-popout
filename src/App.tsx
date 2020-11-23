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
  onOpen?: () => void;
  onClose?: () => void;
}

interface PopupWindowState {
  container?: HTMLElement;
}

class PopupWindow extends React.PureComponent<
  PopupWindowProps,
  PopupWindowState
> {
  window?: Window;
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
          if (this.props.onClose) {
            this.props.onClose();
          }
        }
      }, 1000);
    }
    // Copy the app's styles into the new window
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach(stylesheet => {
      const css = stylesheet as CSSStyleSheet;

      if (stylesheet.href) {
        const newStyleElement = document.createElement('link');
        newStyleElement.rel = 'stylesheet';
        newStyleElement.href = stylesheet.href;
        popupWindow.document.head.appendChild(newStyleElement);
      } else if (css && css.cssRules && css.cssRules.length > 0) {
        const newStyleElement = document.createElement('style');
        Array.from(css.cssRules).forEach(rule => {
          newStyleElement.appendChild(document.createTextNode(rule.cssText));
        });
        popupWindow.document.head.appendChild(newStyleElement);
      }
    });
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
