!function (context) {
  var feedItems = ko.observableArray()
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
        entry.time = formatDatetime(entry.created_at);
        feedItems.push(entry); 
      });
      callback();
    });
  }

  function fetchProjects(callback) {
    $.getJSON('/code.js', function(entries) {
      $(entries).each(function (i, entry) {
        entry.time = 'Last updated ' + formatDatetime(entry.pushed_at);
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

  function feedItemTemplate(entry) {
    return entry.kind + 'Template';
  }

  context.gnab = {
    gotoTab: gotoTab
  , feedItemTemplate: feedItemTemplate
  , feedItems: feedItems
  , projects: projects
  };

}(this);
