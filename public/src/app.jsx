/** @jsx React.DOM */

var App = React.createClass({

  addToken: function() {
  	var number = this.refs.phone.getDOMNode().value;
  	var token = this.refs.token.getDOMNode().value;

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
    	<div className="col-md-12">
    	<input className="form-control" type="text" name="phone" ref="phone" placeholder="Enter Your Phone Number" />
    	</div>
    	<div className="col-md-12">
    	<input className="form-control" type="text" name="token" ref="token" placeholder="Enter This Weeks Token" />
    	</div>
    	<div className="col-md-6 col-md-offset-3">
    	<button  className="btn btn-default btn-lg" onClick={this.addToken}>Add Your Token!</button>
    	</div>
    	</div>
    );
  }
});


React.render(
  <App />,
  document.getElementById('app')
);