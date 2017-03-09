module.exports = class TabManager {
    constructor() {
        this._activeTab = null;
        this._tabs = [];
    }

    place(headerTarget, contentTarget) {
        this._header = $("<ul></ul>").addClass("tabHeader");
        headerTarget.append(this._header);

        this._content = $("<div></div>").addClass("tabContent");
        contentTarget.append(this._content);
    }

    createTab() {
        let tabItem = $("<li></li>").addClass("tabItem");
        this._header.append(tabItem);

        let tabContent = $("<div></div>").addClass("tabContentWrapper");
        this._content.append(tabContent);

        let tab = new Tab(tabItem, tabContent);
        this._tabs.push(tab);

        tabItem.click(() => {
            this.showTab(tab);
        });

        this.showTab(tab);
        return tab;
    }

    showTab(tab) {
        this._tabs.forEach((e) => {
            e.item.removeClass("active");
            e.content.removeClass("active");
        });

        tab.item.addClass("active");
        tab.content.addClass("active");

        this._activeTab = tab;
    }
};

TabManager.Tab = class Tab {
    constructor(item, content) {
        this._item = item;
        this._content = content;
    }

    get content() {
        return this._content;
    }

    get item() {
        return this._item;
    }
};