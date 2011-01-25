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

    $('#loader').show();
    this.loaded = true;

    $.getJSON('/' + this.id + '.js', function(entries) {
      content.empty();

      $(entries).each(function(i, entry) {
        entryTag = self.createEntryTag(entry);
        entryTag.appendTo(content);
      });
      $('#loader').hide();
    });
  }

  function createFeedEntryTag(entry) {
    var entryTag = $('<div class="entry" />');

    if (entry.forwarded) {
      var forwardedTag = $('<span class="forwarded" />');
      forwardedTag.appendTo(entryTag);
      var userTag = $('<a class="user" href="http://twitter.com/' + 
        entry.user + '"/>').text(entry.user);
      userTag.appendTo(entryTag);
    }

    var textTag = $('<span class="text" />').html(' ' + entry.text);
    textTag.appendTo(entryTag);

    var metaTag = $('<div class="meta" />');
    metaTag.html('&nbsp;via&nbsp;');

    var timeTag = $('<a href="http://twitter.com/' + entry.user + 
      '/status/' + entry.id + '" />').text(entry.created_at);
    timeTag.prependTo(metaTag);

    var sourceTag = $('<span />').html(entry.source);
    sourceTag.appendTo(metaTag);

    metaTag.appendTo(entryTag);

    return entryTag;
  }

  function createProjectEntryTag(entry) {
    var entryTag = $('<div class="entry" />');

    var textTag = $('<span class="text" />').html(' ' + entry.description);
    textTag.appendTo(entryTag);

    return entryTag;
  }

  var currentTab, tabs = {
    feed: new Tab('feed', createFeedEntryTag), 
    projects: new Tab('projects', createProjectEntryTag), 
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
