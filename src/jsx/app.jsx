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
    	</div>

    );
  }
});


React.render(
  <App />,
  document.getElementById('app')
);