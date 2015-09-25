var Mailgun = require('mailgun');
Mailgun.initialize('sandboxab78c35cae6a48949a81cc968455e885.mailgun.org', 'key-bb4868e9425cd554bfc7aa55250d1ead');

Parse.Cloud.define('sendMail', function(request, response) {
	Mailgun.sendEmail({
		to: request.params.to,
		from: request.params.from,
		subject: request.params.subject,
		text: request.params.message
	}, {
		success: function(httpResponse) {
			console.log(httpResponse);
			response.success('Email sent!');
		},
		error: function(httpResponse) {
			console.error(httpResponse);
			response.error('Uh oh, something went wrong');
		}
	});
});

Parse.Cloud.define('modifyUser', function(request, response) {
	if (!request.user) {
		response.error('Must be signed in to call this Cloud Function.')
		return;
	}

	if (request.user.attributes.type != 'teacher') {
		response.error('Not an Teacher.')
		return;
	}

	Parse.Cloud.useMasterKey();

	var query = new Parse.Query(Parse.User);
	query.equalTo('username', request.params.username);

	query.first({
		success: function(user) {
			if (request.params.unassign) {
				user.set('teacherId', null);
			} else {
				user.set('teacherId', request.user);
			}

			user.save(null, {
				success: function(user) {
					response.success('Successfully updated user.');
				},
				error: function(gameScore, error) {
					response.error('Could not save changes to user.');
				}
			});
		},
		error: function(error) {
			response.error('Could not find user.');
		}
	});
});

Parse.Cloud.define('removeUserFromGroup', function(request, response) {
	if (!request.user) {
		response.error('Must be signed in to call this Cloud Function.')
		return;
	}

	if (request.user.attributes.type != 'teacher') {
		response.error('Not an Teacher.')
		return;
	}

	Parse.Cloud.useMasterKey();

	var query = new Parse.Query(Parse.User);
	query.equalTo('objectId', request.params.objectId);

	query.first({
		success: function(user) {
			user.set('groupId', null);

			user.save(null, {
				success: function(user) {
					response.success('Successfully updated user.');
				},
				error: function(gameScore, error) {
					response.error('Could not save changes to user.');
				}
			});
		},
		error: function(error) {
			response.error('Could not find user.');
		}
	});
});

Parse.Cloud.define('addUserToGroup', function(request, response) {
	if (!request.user) {
		response.error('Must be signed in to call this Cloud Function.')
		return;
	}

	if (request.user.attributes.type != 'teacher') {
		response.error('Not an Teacher.')
		return;
	}
	
	var group;

	Parse.Cloud.useMasterKey();
	
	var query = new Parse.Query(Parse.Object.extend('Group'));

	query.equalTo('objectId', request.params.groupId);

	query.find({
		success: function(results) {
			
			group = results[0];
			saveGroup();
		},
		error: function(error) {
			alert('Error when getting objects!');
		}
	});
	
	var saveGroup = function () {
		var query = new Parse.Query(Parse.User);
		query.equalTo('objectId', request.params.objectId);
	
		query.first({
			success: function(user) {
				user.set('groupId', group);
	
				user.save(null, {
					success: function(user) {
						response.success('Successfully updated user.');
					},
					error: function(gameScore, error) {
						response.error('Could not save changes to user.');
					}
				});
			},
			error: function(error) {
				response.error('Could not find user.');
			}
		});	
	}
});