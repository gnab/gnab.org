var gnab = (function () {
  var activities = ko.observableArray()
    , projects = ko.observableArray();

  function createTagTagCreator() {
    var lastDayOffset = -1;

    return function (entry) {
      if (lastDayOffset >= 7) {
        return;
      }

      var entryAge = entryAgeInDays(entry);

      if (lastDayOffset == -1 && entryAge >= 7) {
        return;
      }

      if (entryAge > lastDayOffset) {
        var tagTag = $('<div class="tag" />');

        formatTagTag(tagTag, entryAge);

        lastDayOffset = entryAge;

        if (tagTag.text() !== '') {
          return tagTag;
        }
      }
    }
  }

  function entryAgeInDays(entry) {
    var now = Math.floor(new Date() / 1000 / 3600 / 24),
        entryDateStr = entry.pushed_at || entry.created_at,
        entryDate = Math.floor(new Date(entryDateStr) / 1000 / 3600 / 24);

    return now - entryDate;
  }

  function formatTagTag(tagTag, entryAge) {
    if (entryAge === 0) {
      tagTag.text('TODAY');
      tagTag.addClass('today');
    }
    else if (entryAge === 1) {
      tagTag.text('YESTERDAY');
      tagTag.addClass('yesterday');
    }
    else if (entryAge >= 2  && entryAge <= 6) {
      tagTag.text(new Date(Date.now() - 1000 * 3600 * 24 * 
        entryAge).strftime('%A').toUpperCase());
    }
    else if (entryAge >= 7) {
      tagTag.text('EARLIER');
    }
  }

  function fetchActivities(callback) {
    $.getJSON('/feed.js', function(entries) {
      $(entries).each(function (i, entry) {
        activities.push(entry); 
      });
      callback();
    });

    return;

    var entryTag = $('<div class="entry" />');
    var metaTag = $('<div class="meta" />');
    var textTag = $('<div class="text" />');

    if (entry.kind === 'twitter') {
      textTag.html(' ' + entry.text);
      var timeTag = $('<a href="http://twitter.com/' + entry.user + 
        '/status/' + entry.id + '" />').text(formatDatetime(entry.created_at));
      var sourceTag = $('<span />').html(entry.source);
      metaTag.addClass('tweet');
      metaTag.html('&nbsp;via&nbsp;')
        .prepend(timeTag)
        .append(sourceTag);

      if (entry.forwarded) {
        var forwardedTag = $('<span class="forwarded" />');
        var userTag = $('<a class="user" href="http://twitter.com/' + 
          entry.user + '"/>').text(entry.user);

        textTag
          .prepend(userTag)
          .prepend(forwardedTag);
      }
    } else if (entry.kind === 'github') {
      entry.commits.forEach(function (commit) {
        var shaTag = $('<a href="' + entry.repository.url + '/commit/' + 
          commit.sha + '" />').text(commit.sha.substring(0,7));
        var commitTag = $('<div class="commit" />')
          .text(' ' + commit.message)
          .prepend(shaTag);
        textTag.append(commitTag);
      });
      var timeTag = $('<span />').text(formatDatetime(entry.created_at));
      var repoTag = $('<a href="' + entry.repository.url +'" />')
        .text(entry.repository.owner + '/' + entry.repository.name);
      metaTag.addClass('push');
      metaTag.html('&nbsp;to&nbsp;')
        .prepend(timeTag)
        .append(repoTag);
    } else if (entry.kind === 'reader') {
      var titleTag = $('<div class="title" />')
        .append($('<a href="' + entry.url + '"/>').text(entry.title));
      if (entry.forwarded) {
        var forwardedTag = $('<span class="forwarded" />');

        titleTag
          .prepend(forwardedTag);
      }
      var timeTag = $('<span />').text(formatDatetime(entry.created_at));
      textTag.html(entry.text);
      var sourceTag = $('<a href="' + entry.source.url +'" />')
        .text(entry.source.title);
      metaTag.addClass('post');
      metaTag.html('&nbsp;from&nbsp;')
        .prepend(timeTag)
        .append(sourceTag);
      entryTag
        .append(titleTag);
    }

    return entryTag
      .append(textTag)
      .append(metaTag);
  }

  function fetchProjects(callback) {
    $.getJSON('/code.js', function(entries) {
      $(entries).each(function (i, entry) {
        entry.meta = 'Last updated ' + formatDatetime(entry.pushed_at);
        projects.push(entry); 
      });
      callback();
    });
  }

  function formatDatetime(datetime) {
    var ending, date = new Date(datetime);

    switch (date.getDate() % 10) {
      case 1:
        ending = 'st';
        break;
      case 2:
        ending = 'nd';
        break;
      case 3:
        ending = 'rd';
        break
      default:
        ending = 'th';
    }

    return date.strftime('%H:%M %b %e') + ending;
  }

  var currentTab
    , tabs = {
        feed: new Tab('feed', fetchActivities)
      , code: new Tab('code', fetchProjects)
      , about: new Tab('about')
      };

  function gotoTab(tab) {
    if (currentTab) {
      currentTab.hide();
    }
    currentTab = tabs[tab];
    currentTab.show();
  }

  return {
    gotoTab: gotoTab
  , activities: activities
  , projects: projects
  };

})();
