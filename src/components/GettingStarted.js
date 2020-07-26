import React from 'react';

export default class GettingStarted extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gettingStarted: false,
            operators : true
        }
    }

    componentDidMount() {
        this.setState({ gettingStarted: this.props.gettingStarted });
    }

    handleGettingStarted = () => {
        // this.getSessionTokenBitvest()
        this.setState({ gettingStarted: false})
        this.props.callback(this.state.operators);
    };

    render() {
        const { gettingStarted } = this.state;
        return (
            <div style={{ display: gettingStarted ? 'block' : 'none' }}>
                <h6 className="text-center"><strong>Crypto Gambling Foundation Verifier</strong></h6>
                <img alt="logo" src='https://pbs.twimg.com/profile_images/906057204578390016/-icT77rY_400x400.jpg' style={{ width: '75%' }} />

                <p><span style={{ fontStyle: 'bold' }}>Operator</span> is a CGF verified operator.</p>
                <button className="btn btn-info mb-3" type="button" onClick={this.handleGettingStarted}>
                    Get Started Now
    </button>
            </div>
        )
    }
}

