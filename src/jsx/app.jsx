var React = require("react");
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;
var TextField = mui.TextField;
var Dialog = mui.Dialog;
var App = React.createClass({
  getInitialState: function() {
    return {dialogMessage:""};
  },
  addToken: function() {
  	var number = this.refs.phone.getValue();
  	var token = this.refs.token.getValue();
    var email = this.refs.email.getValue();
    var self = this;
    var xhr = new XMLHttpRequest();
  	var url = "/token/new"
  	xhr.open("POST", url, true);
  	xhr.onload = function () {
      self.setState({
        dialogMessage:JSON.parse(xhr.response).message
      });
      self.refs.messageDialog.show();
  	};

  	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");

  	xhr.send("number=" + number + "&token=" + token + "&email=" + email);
  },

  onDismiss: function() {
    this.refs.messageDialog.dismiss();
  },

  render: function() {
    var standardActions = [
        { text: 'Ok!' , onClick: this.onDismiss }
    ];

    var dialog = <Dialog ref="messageDialog" title="Cheers for Peers!" actions={standardActions}>{this.state.dialogMessage} </Dialog>
  
    var style = {textAlign:"center"};
    var listStyle={textAlign: "left"};
    return (
    	<div style={style}>
        {dialog}
        <div className="col-md-6 col-md-offset-3 centered">
          <h1>ST Cheers For Peers</h1>
        </div>
      	<div className="col-md-6 col-md-offset-3 centered">
          <TextField
            floatingLabelText="Phone Number"
            ref="phone" />
        </div>
        <div className="col-md-6 col-md-offset-3 centered">
          <TextField
            floatingLabelText="ST Email Address"
            ref="email" />
        </div>
      	<div className="col-md-6 col-md-offset-3 centered">
          <TextField
            floatingLabelText="TinyPulse Token"
            ref="token" />
      	</div>

      	<div className="col-md-6 col-md-offset-3 centered">

        <RaisedButton label="Add Your Token!" secondary={true} onClick={this.addToken} />
      	</div>
        <div className="col-md-6 col-md-offset-3">
           <h1>How To Use</h1>
          <ol style={listStyle}>
            <li> Click on your latest TinyPulse response button in your gmail account <img src="./respondnow.png" /></li>
            <li>When on TinyPulse, look in the url bar and copy your token, found like this: <img src="./url-screen.png" /></li>
            <li>Enter your phone number(no spaces, dashes, etc.. - 2222222222) and paste this token above</li>
            <li>Now you can send a cheers by texting (516)210-4262 in the following manner, Start the text with the word cheers,
            followed by the beginning of the persons ST email adress (conor for conor@socialtables, danmac for danmac@socialtables.com etc...)
            </li>
            <li>Next simply follow that up with the content of your cheers message</li>
            <li>If you wish to make your cheers anonymous, you can make the final word of the text message "anon"</li>
            <li>That's it</li>
            <li>But, if you need help you can email me at conor@socialtables.com, or come speak to me in person, I sit in one of the dark rooms in the back.</li>
          </ol>

        </div>
    	</div>

    );
  }
});


React.render(
  <App />,
  document.getElementById('app')
);