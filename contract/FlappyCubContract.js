'use strict'

var Data = function (address, timestamp, score) {
    if(this.verifyAddress(address)){
        this.address = address;
        this.timestamp = timestamp;
        this.score = score;
    }else {
        let o = JSON.parse(address);
        this.address = o.address;
        this.timestamp = o.timestamp;
        this.score = o.score;
    }
};

Data.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },
    verifyAddress: function (address) {
        return Blockchain.verifyAddress(address) !== 0;
    }
};

var FlappyCubeContract = function () {
    LocalContractStorage.defineMapProperty(this, "datas", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new Data(str)
        }
    });
    LocalContractStorage.defineProperties(this, {
        worldRecord: {
            stringify: function (obj) {
                return obj.toString();
            },
            parse: function (str) {
                return new Data(str);
            }
        },
        adminAddress: null
    });
};

FlappyCubeContract.prototype = {
    init: function () {
        this.adminAddress = Blockchain.transaction.from;
        this.worldRecord = new Data(this.adminAddress,Date.now(), 1);
        this.setR(this.worldRecord.score)
    },
    setR: function (score) {
        if(parseInt(score) > 0){
            let addr = Blockchain.transaction.from;
            let currentTime = Date.now();
            let data = new Data(addr,currentTime,score);
            let oldData = this.datas.get(addr);
            let wr = this.worldRecord;
            if(oldData instanceof Data){
                if(parseInt(data.score) > parseInt(oldData.score)){
                    this.datas.put(addr,data);
                    if(parseInt(data.score) > parseInt(wr.score)){
                        this.worldRecord = data;
                    }
                }
            }else {
                this.datas.put(addr,data);
            }
            return this.datas.get(addr);
        }else {
            throw new Error("分数异常")
        }
    },
    getR: function () {
        let addr = Blockchain.transaction.from;
        let data = this.datas.get(addr);
        if(data instanceof Data){
            return data;
        }else {
            throw new Error("暂无分数记录")
        }
    },
    _cutWR: function (score) {
        if(parseInt(score) > 0){
            let addr = Blockchain.transaction.from;
            let currentTime = new Date();
            let data = new Data(addr,currentTime,score);
            this.worldRecord = data;
            return data;
        }else {
            throw new Error("分数异常")
        }
    },
    getWR: function () {
        if(this.worldRecord instanceof Data){
            return this.worldRecord;
        }else {
            throw new Error("尚无世界纪录")
        }
    },
    setAdminAddress: function (address) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.adminAddress = address;
        } else {
            throw new Error("Admin only");
        }
    },
};

module.exports = FlappyCubeContract;