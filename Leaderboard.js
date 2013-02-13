(function (window, $) {

if ( ! window.Hub ) window.Hub = {};

var Leaderboard = window.Hub.Leaderboard = function Leaderboard (opts) {
	var self = this;

	this.el = opts.el;
	this.$el = $(opts.el);
	this.apiToken = opts.apiToken;
	this.network = opts.network;
	this.delta = opts.delta;
	this.siteId = opts.siteId;
	this.template = opts.template || Leaderboard.template;
	this.convTemplate = opts.convTemplate || Leaderboard.convTemplate;

	var reqXhr = Leaderboard.request(opts);
	reqXhr.success(function (resp) {
		var data = resp.data && resp.data.leaderboard,
			$ul = self.$el.find('.hub-leaderboard'),
			sortedData = data.sort(function (user) {
				return user.count;
			});

		$(sortedData).each(function (index, user) {
			var $li = $('<li></li>'),
				jid = user.jid,
				userId = jid && jid.split('@')[0];
			$li.html(Leaderboard.userTemplate
				.replace('{{ avatarUrl }}', user.avatar)
				.replace('{{ bio }}', user.bio)
				.replace('{{ count }}', user.count)
				.replace('{{ displayName }}', user.display_name)
				.replace('{{ firstName }}', user.first_name)
				.replace('{{ lastName }}', user.last_name)
				.replace('{{ location }}', user.location)
				.replace('{{ id }}', user.user_id)
				.replace('{{ userId }}', userId)
			);
			$ul.prepend($li);
		});
	});
	return this;
};

function roundNumber(number, digits) {
    var multiple = Math.pow(10, digits);
    var rndedNum = Math.round(number * multiple) / multiple;
    return rndedNum;
}

Leaderboard.request = function (opts) {
	// Calculate the ISO8601 date of the delta
	var deltaDays = opts.delta.days,
		sinceDate = daysAgo(deltaDays),
		deltaDaysIso = iso8601(sinceDate);
	// Build the API URL
	url = 'http://search.{{ network }}/api/v1.1/public/leaderboard/?apitoken={{ apiToken }}&source_ids={{ siteId }}&since={{ since }}'
		.replace('{{ network }}', opts.network)
		.replace('{{ apiToken }}', opts.apiToken)
		.replace('{{ siteId }}', opts.siteId)
		.replace('{{ since }}', deltaDaysIso),
		jqXhr = $.get(url);

	return jqXhr;

	// Return a date that is `deltaDays` ago
	function daysAgo (deltaDays) {
		var now = new Date().getTime(),
			deltaSeconds = -1 * deltaDays * ( 60 * 60 * 24 * 1000 ),
			future = new Date( now + deltaSeconds );
		return future;
	}

	// Serialize a Date to ISO8601
	function iso8601 (date) {
		function pad(n) { return n < 10 ? '0' + n : n; }
        return date.getUTCFullYear() + '-'
            + pad(date.getUTCMonth() + 1) + '-'
            + pad(date.getUTCDate()) + 'T'
            + pad(date.getUTCHours()) + ':'
            + pad(date.getUTCMinutes()) + ':'
            + pad(date.getUTCSeconds()) + 'Z';
	}
};

Leaderboard.prototype.render = function () {
	this.$el.html(this.template);
};

Leaderboard.template = '\
<div class="hub-Leaderboard">\
	<ul class="hub-leaderboard">\
	</ul>\
</ul>\
</div>';

Leaderboard.userTemplate = '\
<div class="hub-author" data-hub-user-id="{{ userId }}">\
	<span class="hub-count">{{ count }}</span>\
	<img class="hub-avatar" src="{{ avatarUrl }}" />\
	<span class="hub-display-name">{{ displayName }}</span>\
	<span class="hub-full-name">\
		<span class="hub-first-name">{{ firstName }}</span>\
		<span class="hub-last-name">{{ lastName }}</span>\
	</span>\
	<p class="hub-location">{{ location }}</p>\
	<p class="hub-bio">{{ bio }}</p>\
</div>';

}(this, jQuery));