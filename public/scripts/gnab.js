!function (context) {
  var feedItems = ko.observableArray()
    , projects = ko.observableArray()
    , ordinals = {1: 'st', 2: 'nd', 3: 'rd', 11: 'th', 12: 'th', 13: 'th'}
    , dayNames = {0: 'today', 1: 'yesterday'}
    , msInADay = 1000 * 3600 * 24;

  function fetchActivities(callback) {
    fetchEntries('/feed.json', feedItems, callback);
  }

  function fetchProjects(callback) {
    fetchEntries('/code.json', projects, callback);
  }

  function fetchEntries(url, list, callback) {
    var previousTag;
    $.getJSON(url, function(entries) {
      $(entries).each(function (i, entry) {
        entry.tag = createEntryTag(entry);
        if (previousTag && entry.tag.text === previousTag.text) {
          entry.tag = {classes:'',text:''}
        }
        else {
          previousTag = entry.tag;
        }
        entry.template = entry.kind + 'Template';
        entry.time = formatDatetime(entry.pushed_at || entry.created_at);
        list.push(entry); 
      });
      callback();
    });
  }

  function createEntryTag(entry) {
    var age = entryAgeInDays(entry)
      , text = age <= 6 ? nameOfDay(age) : '';

    return {
      'class': text !== '' ? 'tag ' + text : ''
    , 'text': text.toUpperCase()
    }
  }

  function entryAgeInDays(entry) {
    var entryDateStr = entry.pushed_at || entry.created_at
      , now = parseInt(new Date().strftime('%Y%m%d'), 10)
      , then = parseInt(new Date(entryDateStr).strftime('%Y%m%d'), 10);

    return now - then;
  }

  function nameOfDay(age) {
    return dayNames[age] || 
      new Date(Date.now() - msInADay * age).strftime('%A');
  }

  function formatDatetime(datetime) {
    var date = new Date(datetime)
      , ending = ordinals[date.getDate()] ||
                 ordinals[date.getDate() % 10] || 
                 'th';

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

  context.gnab = {
    gotoTab: gotoTab
  , feedItems: feedItems
  , projects: projects
  };

}(this);
