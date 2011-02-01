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
    var self = this, content = $('#' + this.id + ' .content');

    content.hide();
    $('#loader').show();

    this.loaded = true;

    $.getJSON('/' + this.id + '.js', function(entries) {
      content.empty();

      $(entries).each(function(i, entry) {
        var entryTag = self.createEntryTag(entry);
        content.append(entryTag);
      });

      $('#loader').hide();
      content.fadeIn();
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

  function createFeedEntryTag(entry) {
    var entryTag = $('<div class="entry" />');
    var metaTag = $('<div class="meta" />');
    var textTag = $('<div class="text" />'); 

    if (entry.kind == 'twitter') {
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
    } else if (entry.kind == 'github') {
      entry.commits.forEach(function (commit) {
        var shaTag = $('<a href="#" />').text(commit.sha.substring(0,5));
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

  var currentTab, tabs = {
    feed: new Tab('feed', createFeedEntryTag), 
    code: new Tab('code', createCodeEntryTag), 
    links: new Tab('links')
  }
  
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
