var React = require("react");
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;
var TextField = mui.TextField;
var Paper = mui.Paper;
var App = React.createClass({

  addToken: function() {
  	var number = this.refs.phone.getValue();
  	var token = this.refs.token.getValue();
    console.log(number);
    console.log(token);
  	var xhr = new XMLHttpRequest();
	var url = "/token/new"
	xhr.open("POST", url, true);
	xhr.onload = function () {
	    console.log(xhr.responseText);
	};
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xhr.send("number=" + number + "&token=" + token);
  },

  render: function() {
    return (
    	<div>

        <div className="col-md-6 col-md-offset-3 centered">
          <h1>Cheers For Peers</h1>
        </div>
      	<div className="col-md-6 col-md-offset-3 centered">
          <TextField
            floatingLabelText="Phone Number"
            ref="phone" />
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
          <ol>
            <li> Click on your latest TinyPulse response button in your gmail account <img src="./respondnow.png" /></li>
            <li>When on TinyPulse, look in the url bar and copy your token, found like this: <img src="./url-screen.png" /></li>
            <li>Enter your phone number(no spaces, dashes, etc.. - 2222222222) and paste this token above</li>
            <li>Now you can send a cheers by texting (516)2210-4262 in the following manner, Start the text with the word cheers,
            followed by the beginning of the persons ST email adress (conor for conor@socialtables, danmac for danmac@socialtables.com etc...)
            </li>
            <li>Next simply follow that up with the content of your cheers message</li>
            <li>If you wish to make your cheers anonymous, you can make the final word of the text message "anon"</li>
            <li>That's it</li>
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