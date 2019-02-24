import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export const BarStyles = {
  BARS: '0',
  CANDLES: '1',
  HOLLOW_CANDLES: '9',
  HEIKIN_ASHI: '8',
  LINE: '2',
  AREA: '3',
  RENKO: '4',
  LINE_BREAK: '7',
  KAGI: '5',
  POINT_AND_FIGURE: '6'
};

export const IntervalTypes = {
  D: 'D',
  W: 'W'
};

export const RangeTypes = {
  YTD: 'ytd',
  ALL: 'all'
};

export const Themes = {
  LIGHT: 'Light',
  DARK: 'Dark'
};

const SCRIPT_ID = 'tradingview-widget-script';
const CONTAINER_ID = 'tradingview-widget';

export default class TradingViewWidget extends PureComponent {
  static propTypes = {
    largeChartUrl: PropTypes.string
  };

  static defaultProps = {
    
    autosize: false,
    dateRange: "1m",
    theme: Themes.LIGHT,
    trendLineColor: "#37a6ef",
    underLineColor: "#e3f2fd",
    timezone: 'Etc/UTC',
    toolbar_bg: '#F1F3F6',
    widgetType: 'widget',
    width: "100%",
    height: 200,
    withdateranges: false
  };

  containerId = `${CONTAINER_ID}-${Math.random()}`;

  componentDidMount = () => this.appendScript(this.initWidget);

  componentDidUpdate = () => {
    this.cleanWidget();
    this.initWidget();
  };

  canUseDOM = () => !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  );

  appendScript = (onload) => {
    if (!this.canUseDOM()) {
      onload();
      return;
    }

    if (this.scriptExists()) {
      /* global TradingView */
      if (typeof TradingView === 'undefined') {
        this.updateOnloadListener(onload);
        return;
      }
      onload();
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.onload = onload;
    document.getElementsByTagName('head')[0].appendChild(script);
  };

  getScriptElement = () =>
    document.getElementById(SCRIPT_ID);

  scriptExists = () =>
    this.getScriptElement() !== null;

  updateOnloadListener = (onload) => {
    const script = this.getScriptElement();
    const oldOnload = script.onload;
    return script.onload = () => {
      oldOnload();
      onload();
    };
  };

  initWidget = () => {
    /* global TradingView */
    if (typeof TradingView === 'undefined') return;

    const { widgetType, ...widgetConfig } = this.props;
    const config = { ...widgetConfig, container_id: this.containerId };

    if (config.autosize) {
      delete config.width;
      delete config.height;
    }

    if (typeof config.interval === 'number') {
      config.interval = config.interval.toString();
    }

    if (config.popup_width && typeof config.popup_width === 'number') {
      config.popup_width = config.popup_width.toString();
    }

    if (config.popup_height && typeof config.popup_height === 'number') {
      config.popup_height = config.popup_height.toString();
    }

    /* global TradingView */
    new TradingView[widgetType](config);
  };

  cleanWidget = () => {
    if (!this.canUseDOM()) return;
    document.getElementById(this.containerId).innerHTML = '';
  };

  getStyle = () => {
    if (!this.props.autosize) return {};
    return {
      width: '100%',
      height: '100%'
    };
  };

  render = () => <article id={this.containerId} style={this.getStyle()} />
}
