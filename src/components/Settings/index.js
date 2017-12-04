import React from 'react';
import {
    getNSFW,
    getLowRated,
    updateLowRated,
    updateNSFW,
    getSettings,
    updateSettings
} from '../../actions/settings';
import {
    connect,
    store
} from 'react-redux';
import Constants from '../../common/constants';
import PropTypes from 'prop-types';

class Settings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            settings: {
                [Constants.SETTINGS.show_low_rated]: false,
                [Constants.SETTINGS.show_nsfw]: false
            },
            saveSettings: getSettings(),
            success: false,
            uptodate: false,
            buttonDisabled: false,
            buttonText: Constants.SETTINGS_LABELS.save
        };
    }

    componentDidMount() {
        const userSettings = getSettings();

        this.setState({
            settings: userSettings
        });
    }

    _setDefaultMessageOptions() {
        this.setState({
            success: false,
            uptodate: false
        });
    }

    handleInputChange(name) {
        let settings = this.state.settings;

        this._setDefaultMessageOptions();

        settings[name] = !this.state.settings[name];
        this.setState({ settings: settings });
    }

    showNotice(noticeText) {
        this.setState({
            buttonDisabled : true,
            buttonText : noticeText
        }, () => {
            setTimeout(() => {
                this.setState({
                    buttonDisabled : false,
                    buttonText : Constants.SETTINGS_LABELS.save,
                    uptodate : false,
                    success : false
                })
            }, 1300);
        });
    }

    needsNotice() {
        if (this.state.success) {
            this.showNotice(Constants.SETTINGS_LABELS.succesSave)
        } else
        if (this.state.uptodate) {
            this.showNotice(Constants.SETTINGS_LABELS.upToDate)
        }
    }

    upateSettings() {
        if (this.state.buttonDisabled) return false;
        if (JSON.stringify(this.state.saveSettings) != JSON.stringify(this.state.settings)) {
                updateSettings(this.state.settings);
                this.setState({
                    success: true,
                    saveSettings: getSettings()
                }, () => this.needsNotice());
        } else {
            this.setState({ uptodate : true }, () => this.needsNotice());
            
        }
    }

    render() {
        const message = <div className='message'>{this.state.message}</div>;
        let buttonClassName = "btn";
        if (this.state.success) {
            buttonClassName += " btn-success"
         } else
        if (this.state.uptodate) {
            buttonClassName += " btn-primary"
        } else {
            buttonClassName += " btn-default";
        }
        return(
            <div className="container container-settings">
                <div className="row container-settings__content-wrapper">
                    <div className="col-xs-12 col-sm-10 col-sm-offset-1 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">
                        <div className="card-field text--center">
                            <div className="card-field__header">
                                <h2 className="card-field__heading">Settings</h2>
                            </div>
                            <div className="card-field__body">
                                <div className='form-group settings-switcher'>
                                    <label htmlFor="lowRated" className="name">Show low rated posts</label>
                                    <div className="input-container">
                                        <div className="checkbox">
                                            <label>
                                                <input
                                                    name="lowRated"
                                                    type="checkbox"
                                                    checked={this.state.settings[Constants.SETTINGS.show_low_rated]}
                                                    onChange={this.handleInputChange.bind(this, Constants.SETTINGS.show_low_rated)} />
                                                <div className="box"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group settings-switcher'>
                                    <label htmlFor="nsfw" className="name">Show NSFW posts</label>
                                    <div className="input-container">
                                        <div className="checkbox">
                                            <label>
                                                <input
                                                    name="nsfw"
                                                    type="checkbox"
                                                    checked={this.state.settings[Constants.SETTINGS.show_nsfw]}
                                                    onChange={this.handleInputChange.bind(this, Constants.SETTINGS.show_nsfw)} />
                                                    <div className="box"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <button className={buttonClassName} onClick={this.upateSettings.bind(this)}>
                                    {this.state.buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
  return {
    localization: state.localization
  };
};

export default connect(mapStateToProps)(Settings);
