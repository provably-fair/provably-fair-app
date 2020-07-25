import React from 'react';

export default class Settings extends React.Component {
    constructor() {
        super();
        this.state = {
            settings:false,
            clientSeed: '',
            serverSeedHash: null,
            previousSeed: '',
            }
    }
    render() {
        const { settings, clientSeed, serverSeedHash, nonce, cryptoGames, stake, apiKey, 
      Balance, BetId, Roll, nonceChecked, toggleState, betAmount, betPayout, betPlaced} = this.state;
        return (
            <div>
                <div className="SettingsUI Bitvest Stake" style={{ display: settings ? 'block' : 'none' }}>
                    <div className="form-group">
                        <label className="form-control-label">Next Server Seed Hash </label>
                        <img alt="next-server-seed-hash" src="https://camo.githubusercontent.com/184f5fe3162ac51bdc0c89207d568c691d053aea/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f353331393931362f323437373339332f36303565656639362d623037302d313165332d383134612d3637613132383166303665312e706e67" style={{ width: '10%' }}
                            data-toggle="popover" data-placement="left" title="This is the server seed that has been created by the casino. It is sent to you in advance of any bets being made to ensure the casino did not change or manipulate the outcome of any game results. It is hashed(encrypted) to prevent players from calculating the upcoming game results. Once you request a new server seed, the one that is currently in use will be unhashed(decrypted) and sent to the verification tab. All bets made using that server seed will be automatically verified. You will be notified if any bets did not pass verification." />
                        <input className="form-control form-control-sm" type="text" value={serverSeedHash} placeholder="" onChange={(e) => { this.setState({ serverSeedHash: e.target.value }) }} />
                        <button type="button" className="btn btn-secondary m-2" onClick={this.handleRequest}> Request</button>
                    </div>

                    <div className="form-group">
                        <label className="form-control-label">Client Seed</label>
                        <img alt="client-seed" src="https://camo.githubusercontent.com/184f5fe3162ac51bdc0c89207d568c691d053aea/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f353331393931362f323437373339332f36303565656639362d623037302d313165332d383134612d3637613132383166303665312e706e67" style={{ width: '10%' }} data-toggle="popover" data-placement="left" title="This is the client seed. Sometimes called the player seed. It is very important that you customize this after you request a new server seed. The server seed and client seed pre-filled by default. To ensure provable fairness, you must customize your own client seed. It will be used in combination with the server seed to generate thr game results." />

                        <input className="form-control form-control-sm" type="text" value={clientSeed} placeholder="CURRENT CLIENT SEED" onChange={(e) => { this.setState({ clientSeed: e.target.value }) }} />
                        <button type="button" className="btn btn-secondary m-2" onClick={this.getClientSeed}> Generate</button>
                        <button type="button" className="btn btn-secondary m-2" onClick={() => { stake && this.submitClientSeedStake(clientSeed) }}> Submit</button>
                    </div>

                    <div className="form-group" style={{ display: toggleState ? 'block' : 'none' }}>
                        <h3> Place Bet</h3>
                        <label className="form-control-label">Amount</label>
                        <input className="form-control form-control-sm" type="number" value={betAmount} placeholder="" onChange={(e) => { this.setState({ betAmount: e.target.value }) }} />
                        <label className="form-control-label">Payout</label>
                        <input className="form-control form-control-sm" type="number" value={betPayout} placeholder="" onChange={(e) => { this.setState({ betPayout: e.target.value }) }} />

                        <div className="custom-control custom-checkbox mb-3">
                            <input className="custom-control-input" id="customCheck2" type="checkbox" checked={nonceChecked} onChange={(e) => { this.setState({ nonceChecked: e.target.checked }) }} />
                            <label className="custom-control-label" htmlFor="customCheck2">Add Nonce.</label>
                        </div>
                        <div className="form-group" style={{ display: nonceChecked ? 'block' : 'none' }}>
                            <label className="form-control-label">Nonce</label>
                            <input className="form-control form-control-sm" type="number" placeholder="" value={nonce} onChange={(e) => { this.setState({ nonce: e.target.value }) }} />
                        </div>
                        <button type="button" className="btn btn-secondary m-2" onClick={() => {
                            this.setState({ betPlaced: true, verification: false })
                            this.placeBet(apiKey)
                        }}> Bet</button>
                    </div>

                    <div style={{ display: betPlaced ? 'block' : 'none' }}>
                        <div className="alert alert-info" role="alert">
                            <strong>Your Placed Bet result : {Roll}</strong>
                        </div>
                        <div className="alert alert-primary" role="alert" style={{ fontSize: '11px' }}>
                            Balance : {Balance}
                        </div>
                        <div className="alert alert-warning" role="alert" style={{ fontSize: '11px' }}>
                            BetId : {BetId}
                        </div>
                    </div>
                </div>
                <div className="SettingsUI-CryptoGames" style={{ display: cryptoGames ? 'block' : 'none' }}>
                    <div className="nav-wrapper">
                        <ul className="nav nav-pills nav-fill flex-md-row" id="tabs-icons-text" role="tablist">
                            <li className="nav-item show" onClick={() => {
                                this.setState({ gettingStarted: false, settings: true, verification: false, operators: false });
                                this.getServerSeed(apiKey)
                            }}>
                                <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-1-tab" data-toggle="tab" href="#tabs-icons-text-1" role="tab" aria-controls="tabs-icons-text-1" aria-selected="true"><i className="fa fa-cloud-upload-96 mr-2"></i>Settings</a>
                            </li>
                            <li className="nav-item" onClick={() => {
                                this.setState({ gettingStarted: false, settings: false, verification: true, operator: false });

                            }}>
                                <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-2-tab" data-toggle="tab" href="#tabs-icons-text-2" role="tab" aria-controls="tabs-icons-text-2" aria-selected="false"><i className="fa fa-bell-55 mr-2"></i>Verification</a>
                            </li>
                            <li className="nav-item" onClick={() => {
                                this.setState({ gettingStarted: false, settings: false, verification: false, operators: true });
                            }}>
                                <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false"><i className="fa fa-calendar-grid-58 mr-2"></i>Casinos</a>
                            </li>
                        </ul>
                    </div>
                    <label className="custom-toggle" style={{ position: 'absolute' }}>
                        <input type="checkbox" checked={toggleState} onChange={(e) => { this.setState({ toggleState: !toggleState, betPlaced: false }) }} />
                        <span className="custom-toggle-slider rounded-circle" data-label-off="No" data-label-on="Yes"></span>
                    </label>
                    <label className="ml-5 pl-3 form-control-label">Make bets from extension</label>

                    <div className="form-group">
                        <label className="form-control-label">Server Seed Hash</label>
                        <input className="form-control form-control-sm" type="text" value={serverSeedHash} placeholder="7dfh6fg6jg6k4hj5khj6kl4h67l7mbngdcghgkv" onChange={(e) => { this.setState({ serverSeedHash: e.target.value }) }} />
                    </div>
                    <div className="form-group">
                        <label className="form-control-label">Client Seed</label>
                        <input className="form-control form-control-sm" type="text" value={clientSeed} placeholder="CURRENT CLIENT SEED" onChange={(e) => { this.setState({ clientSeed: e.target.value }) }} />
                        <button type="button" className="btn btn-secondary m-2" onClick={this.getClientSeed}> Generate</button>
                    </div>

                    <div className="form-group" style={{ display: toggleState ? 'block' : 'none' }}>
                        <h3> Place Bet</h3>
                        <label className="form-control-label">Amount</label>
                        <input className="form-control form-control-sm" type="number" value={betAmount} placeholder="" onChange={(e) => { this.setState({ betAmount: e.target.value }) }} />
                        <label className="form-control-label">Payout</label>
                        <input className="form-control form-control-sm" type="number" value={betPayout} placeholder="" onChange={(e) => { this.setState({ betPayout: e.target.value }) }} />

                        <div className="custom-control custom-checkbox mb-3">
                            <input className="custom-control-input" id="customCheck2" type="checkbox" checked={nonceChecked} onChange={(e) => { this.setState({ nonceChecked: e.target.checked }) }} />
                            <label className="custom-control-label" htmlFor="customCheck2">Add Nonce.</label>
                        </div>
                        <div className="form-group" style={{ display: nonceChecked ? 'block' : 'none' }}>
                            <label className="form-control-label">Nonce</label>
                            <input className="form-control form-control-sm" type="number" placeholder="" value={nonce} onChange={(e) => { this.setState({ nonce: e.target.value }) }} />
                        </div>
                        <button type="button" className="btn btn-secondary m-2" onClick={() => {
                            this.setState({ betPlaced: true, verification: false })
                            this.placeBet(apiKey)
                        }}> Bet</button>
                    </div>
                    <div style={{ display: betPlaced ? 'block' : 'none' }}>
                        <div className="alert alert-info" role="alert">
                            <strong>Your Placed Bet result : {Roll}</strong>
                        </div>
                        <div className="alert alert-primary" role="alert" style={{ fontSize: '11px' }}>
                            Balance : {Balance}
                        </div>
                        <div className="alert alert-warning" role="alert" style={{ fontSize: '11px' }}>
                            BetId : {BetId}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


