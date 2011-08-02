!function (context) {

  function Tab(id, contentFetcher) {
    this.id = id;
    this.fetchContent = contentFetcher;
    this.hide();
  }

  Tab.prototype.show = function () {
    $('#' + this.id + 'Tab').addClass('active');
    $('#' + this.id).show();
    if (this.fetchContent && !this.loaded) {
      this.load();
    }
    else {
      this.showContent();
    }
  };

  Tab.prototype.hide = function () {
    $('#' + this.id + 'Tab').removeClass('active');
    $('#' + this.id).hide();
    this.hideContent();
  };

  Tab.prototype.showContent = function () {
    $('#' + this.id + ' .content').fadeIn();
  };

  Tab.prototype.hideContent = function () {
    $('#' + this.id + ' .content').hide();
  };

  Tab.prototype.load = function () {
    var self = this;

    $('#loader').show();

    this.fetchContent(function () {
      $('#loader').hide();
      self.showContent();
    });

    this.loaded = true;
  };

  context.Tab = Tab;

}(this);
