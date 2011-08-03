Map = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.dataIndex = new Array();
    self.data = new Object();
};

Map.prototype.get = function() {
    var self = this;

    return self.data;
};

Map.prototype.setElement = function(key, value) {
    var self = this;

    self.dataIndex.push(key);

    self.data[key] = value;
};

Map.prototype.getElement = function(key) {
    var self = this;

    return self.data[key];
};

Map.prototype.removeElement = function(key) {
    var self = this;

    self.dataIndex = Object.keys(self.data);

    delete self.data[key];
};

Map.prototype.hasElement = function(key) {
    var self = this;

    return self.data.hasOwnProperty(key);
};

Map.prototype.getFirstElement = function() {
    var self = this;

    return self.data[Object.keys(self.data).shift()];
};

Map.prototype.getLastElement = function() {
    var self = this;

    return self.data[Object.keys(self.data).pop()];
};

Map.prototype.countElement = function() {
    var self = this;

    return Object.keys(self.data).length;
};

Map.prototype.getSorted = function(){
    var self = this;

    var sortedData = new Object();

    self.dataIndex.sort();

    for(var i in self.dataIndex) {
        sortedData[self.dataIndex[i]] = self.data[self.dataIndex[i]];
    }

    return sortedData;
};

