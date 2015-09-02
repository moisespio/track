app.factory('notificationService', function ($http, $q) {
	return {
		send: function (senderId, receiverId, from, to, subject, message) {
			Parse.Cloud.run('sendMail', {
				from: from,
				to: to,
				subject: subject,
				message: message,
			}, {
				success: function(status) {
					console.log("status:", status);
				},
				error: function(error) {
					console.log("error:", error);
				}
			});

			var Message = Parse.Object.extend("Message");
			var messageObject = new Message();

			messageObject.set('subject', subject);
			messageObject.set('message', message);
			messageObject.set('senderId', senderId);
			messageObject.set('receiverId', receiverId);
			messageObject.set('unread', true);

			messageObject.save();

			return true;
		}
	};
});