import React from 'react';

export default class Navbar extends React.Component {
    constructor() {
        super();
        this.state = {
            settings: false,
            verification: false,
            operators: false,
            faqs: false
        }
    }
    render() {
        const { settings, verification, operators, faqs } = this.state;
        return (
            <div className="nav-wrapper">
                <ul className="nav nav-pills nav-fill flex-md-row" id="tabs-icons-text" role="tablist">
                    <li className={settings ? "nav-item show" : "nav-item"}
                        onClick={() => {
                            this.setState({ gettingStarted: false, settings: true, verification: false, operators: false, faqs: false });
                        }}>
                        <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-1-tab" data-toggle="tab" href="#tabs-icons-text-1" role="tab" aria-controls="tabs-icons-text-1" aria-selected="true">Settings</a>
                    </li>
                    <li className={verification ? "nav-item show" : "nav-item"} onClick={() => {
                        this.getAllBetsStake();
                        this.setState({ gettingStarted: false, settings: false, verification: true, operators: false, faqs: false });
                    }}>
                        <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-2-tab" data-toggle="tab" href="#tabs-icons-text-2" role="tab" aria-controls="tabs-icons-text-2" aria-selected="false">Verification</a>
                    </li>
                    <li className={operators ? "nav-item show" : "nav-item"} onClick={() => {
                        this.setState({ gettingStarted: false, settings: false, verification: false, operators: true, faqs: false });
                    }}>
                        <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false">Casinos</a>
                    </li>
                    <li className={faqs ? "nav-item show" : "nav-item"} onClick={() => {
                        this.setState({ gettingStarted: false, settings: false, verification: false, operators: false, faqs: true });
                    }}>
                        <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false">FAQs</a>
                    </li>
                </ul>
            </div>
        );
    }
}

