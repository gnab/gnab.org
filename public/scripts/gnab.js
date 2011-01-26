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

  function createFeedEntryTag(entry) {
    var entryTag = $('<div class="entry" />');

    var textTag = $('<div class="text" />').html(' ' + entry.text);

    if (entry.forwarded) {
      var forwardedTag = $('<span class="forwarded" />');
      var userTag = $('<a class="user" href="http://twitter.com/' + 
        entry.user + '"/>').text(entry.user);

      textTag
        .prepend(userTag)
        .prepend(forwardedTag);
    }

    var timeTag = $('<a href="http://twitter.com/' + entry.user + 
      '/status/' + entry.id + '" />').text(entry.created_at);

    var sourceTag = $('<span />').html(entry.source);

    var metaTag = $('<div class="meta" />')
      .html('&nbsp;via&nbsp;')
      .prepend(timeTag)
      .append(sourceTag);

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
