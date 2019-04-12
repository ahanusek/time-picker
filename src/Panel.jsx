import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import Header from './Header';
import Combobox from './Combobox';

function noop() {}

function generateOptions(length, disabledOptions, hideDisabledOptions, step = 1) {
  const arr = [];
  for (let value = 0; value < length; value += step) {
    if (!disabledOptions || disabledOptions.indexOf(value) < 0 || !hideDisabledOptions) {
      arr.push(value);
    }
  }
  return arr;
}

function toNearestValidTime(time, hourOptions, minuteOptions, secondOptions) {
  const hour = hourOptions
    .slice()
    .sort((a, b) => Math.abs(time.hour() - a) - Math.abs(time.hour() - b))[0];
  const minute = minuteOptions
    .slice()
    .sort((a, b) => Math.abs(time.minute() - a) - Math.abs(time.minute() - b))[0];
  const second = secondOptions
    .slice()
    .sort((a, b) => Math.abs(time.second() - a) - Math.abs(time.second() - b))[0];
  return moment(`${hour}:${minute}:${second}`, 'HH:mm:ss');
}

class Panel extends Component {
  static propTypes = {
    clearText: PropTypes.string,
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    defaultOpenValue: PropTypes.object,
    value: PropTypes.object,
    placeholder: PropTypes.string,
    format: PropTypes.string,
    inputReadOnly: PropTypes.bool,
    disabledHours: PropTypes.func,
    disabledMinutes: PropTypes.func,
    disabledSeconds: PropTypes.func,
    hideDisabledOptions: PropTypes.bool,
    onChange: PropTypes.func,
    onAmPmChange: PropTypes.func,
    onEsc: PropTypes.func,
    showHour: PropTypes.bool,
    showMinute: PropTypes.bool,
    showSecond: PropTypes.bool,
    use12Hours: PropTypes.bool,
    hourStep: PropTypes.number,
    minuteStep: PropTypes.number,
    secondStep: PropTypes.number,
    addon: PropTypes.func,
    focusOnOpen: PropTypes.bool,
    onKeyDown: PropTypes.func,
    clearIcon: PropTypes.node,
  };

  static defaultProps = {
    prefixCls: 'rc-time-picker-panel',
    onChange: noop,
    disabledHours: noop,
    disabledMinutes: noop,
    disabledSeconds: noop,
    defaultOpenValue: moment(),
    use12Hours: false,
    addon: noop,
    onKeyDown: noop,
    onAmPmChange: noop,
    inputReadOnly: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    const value = nextProps.value;
    if (value) {
      this.setState({
        value,
      });
    }
  }

  onChange = newValue => {
    const { onChange } = this.props;
    this.setState({ value: newValue });
    onChange(newValue);
  };

  onAmPmChange = ampm => {
    const { onAmPmChange } = this.props;
    onAmPmChange(ampm);
  };

  onCurrentSelectPanelChange = currentSelectPanel => {
    this.setState({ currentSelectPanel });
  };

  disabledHours = () => {
    const { use12Hours, disabledHours } = this.props;
    let disabledOptions = disabledHours();
    if (use12Hours && Array.isArray(disabledOptions)) {
      if (this.isAM()) {
        disabledOptions = disabledOptions.filter(h => h < 12).map(h => (h === 0 ? 12 : h));
      } else {
        disabledOptions = disabledOptions.map(h => (h === 12 ? 12 : h - 12));
      }
    }
    return disabledOptions;
  };

  // https://github.com/ant-design/ant-design/issues/5829
  close() {
    const { onEsc } = this.props;
    onEsc();
  }

  isAM() {
    const { defaultOpenValue } = this.props;
    const { value } = this.state;
    const realValue = value || defaultOpenValue;
    return realValue.hour() >= 0 && realValue.hour() < 12;
  }

  render() {
    const {
      prefixCls,
      className,
      placeholder,
      disabledMinutes,
      disabledSeconds,
      hideDisabledOptions,
      showHour,
      showMinute,
      showSecond,
      format,
      defaultOpenValue,
      clearText,
      onEsc,
      addon,
      use12Hours,
      focusOnOpen,
      onKeyDown,
      hourStep,
      minuteStep,
      secondStep,
      inputReadOnly,
      clearIcon,
    } = this.props;
    const { value, currentSelectPanel } = this.state;
    const disabledHourOptions = this.disabledHours();
    const disabledMinuteOptions = disabledMinutes(value ? value.hour() : null);
    const disabledSecondOptions = disabledSeconds(
      value ? value.hour() : null,
      value ? value.minute() : null,
    );
    const hourOptions = generateOptions(24, disabledHourOptions, hideDisabledOptions, hourStep);
    const minuteOptions = generateOptions(
      60,
      disabledMinuteOptions,
      hideDisabledOptions,
      minuteStep,
    );
    const secondOptions = generateOptions(
      60,
      disabledSecondOptions,
      hideDisabledOptions,
      secondStep,
    );

    const validDefaultOpenValue = toNearestValidTime(
      defaultOpenValue,
      hourOptions,
      minuteOptions,
      secondOptions,
    );

    return (
      <div
        className={classNames({
          [`${prefixCls}-inner`]: true,
          [className]: !!className,
        })}
      >
        <Header
          clearText={clearText}
          prefixCls={prefixCls}
          defaultOpenValue={validDefaultOpenValue}
          value={value}
          currentSelectPanel={currentSelectPanel}
          onEsc={onEsc}
          format={format}
          placeholder={placeholder}
          hourOptions={hourOptions}
          minuteOptions={minuteOptions}
          secondOptions={secondOptions}
          disabledHours={this.disabledHours}
          disabledMinutes={disabledMinutes}
          disabledSeconds={disabledSeconds}
          onChange={this.onChange}
          focusOnOpen={focusOnOpen}
          onKeyDown={onKeyDown}
          inputReadOnly={inputReadOnly}
          clearIcon={clearIcon}
        />
        <Combobox
          prefixCls={prefixCls}
          value={value}
          defaultOpenValue={validDefaultOpenValue}
          format={format}
          onChange={this.onChange}
          onAmPmChange={this.onAmPmChange}
          showHour={showHour}
          showMinute={showMinute}
          showSecond={showSecond}
          hourOptions={hourOptions}
          minuteOptions={minuteOptions}
          secondOptions={secondOptions}
          disabledHours={this.disabledHours}
          disabledMinutes={disabledMinutes}
          disabledSeconds={disabledSeconds}
          onCurrentSelectPanelChange={this.onCurrentSelectPanelChange}
          use12Hours={use12Hours}
          isAM={this.isAM()}
        />
        {addon(this)}
      </div>
    );
  }
}

export default Panel;
