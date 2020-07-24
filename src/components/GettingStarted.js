<div style={{ display: gettingStarted ? 'block' : 'none' }}>
    <h6 className="text-center"><strong>Crypto Gambling Foundation Verifier</strong></h6>
    <img src='https://pbs.twimg.com/profile_images/906057204578390016/-icT77rY_400x400.jpg' style={{ width: '75%' }} />

    <p><span style={{ fontStyle: 'bold' }}>Operator</span> is a CGF verified operator.</p>
    <button className="btn btn-info mb-3" type="button" onClick={() => {
        // this.getSessionTokenBitvest()
        this.setState({ gettingStarted: !gettingStarted, operators: true })
    }}>
        Get Started Now
    </button>
</div>