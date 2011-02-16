var gnab = (function () {

  function Tab(id, entryTagCreator) {
    this.id = id;
    this.createEntryTag = entryTagCreator;
  }

  Tab.prototype.show = function () {
    $('#' + this.id + 'Tab').addClass('active');
    $('#' + this.id).show();
    if (!this.loaded) {
      this.load();
    }
  }

  Tab.prototype.hide = function () {
    $('#' + this.id + 'Tab').removeClass('active');
    $('#' + this.id).hide();
  }

  Tab.prototype.load = function () {
    var self = this, content = $('#' + this.id + ' .content'), 
      lastDayOffset = -1;

    content.hide();
    $('#loader').show();

    this.loaded = true;

    $.getJSON('/' + this.id + '.js', function(entries) {
      content.empty();

      $(entries).each(function(i, entry) {
        var entryTag = self.createEntryTag(entry);
        var dayOffset = entryAgeInDays(entry);

        if (dayOffset > lastDayOffset) {
          var tagTag = $('<div class="tag" />');

          if (dayOffset === 0) {
            tagTag.text('TODAY');
            tagTag.addClass('today');
          }
          else if (dayOffset === 1) {
            tagTag.text('YESTERDAY');
            tagTag.addClass('yesterday');
          }
          else if (dayOffset >= 2  && dayOffset <= 6) {
            tagTag.text(new Date(Date.now() - 1000 * 3600 * 24 * 
              dayOffset).strftime('%A').toUpperCase());
          }
          else if (dayOffset === 7) {
              tagTag.text('A WEEK AGO');
          }

          if (tagTag.text() !== '') {
            content.append(tagTag);
          }
          lastDayOffset = dayOffset;
        }

        content.append(entryTag);
      });

      $('#loader').hide();
      content.fadeIn();
    });
  }

  function entryAgeInDays(entry) {
    var now = Math.floor(new Date() / 1000 / 3600 / 24),
        created_at = Math.floor(new Date(entry.created_at) / 1000 / 3600 / 24);

    return now - created_at;
  }

  function createFeedEntryTag(entry) {
    var entryTag = $('<div class="entry" />');
    var metaTag = $('<div class="meta" />');
    var textTag = $('<div class="text" />');

    if (entry.kind === 'twitter') {
      textTag.html(' ' + entry.text);
      var timeTag = $('<a href="http://twitter.com/' + entry.user + 
        '/status/' + entry.id + '" />').text(formatDatetime(entry.created_at));
      var sourceTag = $('<span />').html(entry.source);
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
      metaTag.html('&nbsp;to&nbsp;')
        .prepend(timeTag)
        .append(repoTag);
    }

    return entryTag
      .append(textTag)
      .append(metaTag);
  }

  function createCodeEntryTag(entry) {
    var entryTag = $('<div class="entry" />');

    var languageTag = $('<span class="meta right" />')
      .text(entry.language);

    var watchersTag = $('<span class="meta watchers right" />')
      .text(entry.watchers);

    var forksTag = $('<span class="meta forks right" />')
      .text(entry.forks);

    var nameTag = $('<div class="title" />')
      .append($('<a href="' + entry.url + '"/>').text(entry.name))

    var textTag = $('<div class="text" />').html(' ' + entry.description);

    var metaTag = $('<div class="meta" />')
      .text('Last updated ' + entry.updated_at);

    return entryTag
      .append(forksTag)
      .append(watchersTag)
      .append(languageTag)
      .append(nameTag)
      .append(textTag)
      .append(metaTag);
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

  var currentTab, tabs = {
    feed: new Tab('feed', createFeedEntryTag), 
    code: new Tab('code', createCodeEntryTag), 
    about: new Tab('about')
  }

  tabs['about'].loaded = true;
  
  return {
    gotoTab: function(tab) {
      if (currentTab) {
        currentTab.hide();
      }
      currentTab = tabs[tab];
      currentTab.show();
    }
  };

})();
