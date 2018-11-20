/*
* @Author: Administrator
* @Date:   2018-11-13 11:29:04
* @Last Modified by:   Administrator
* @Last Modified time: 2018-11-20 20:26:08
*/

'use strict';

var mongodb = require('./db');

// 获取填写的blog内容
var getArticleInfo = function () {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
    }
  //要存入数据库的文档
    return {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post,
        id: Date.now().toString(36)
    };
}

// 打开数据库找到posts集合
var openMongoDB = function (callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            callback(collection);
            mongodb.close();
        });
    });
}

var operationCallBack = function (err, data, callback) {
    mongodb.close();
    if (err) {
        return callback(err);//失败！返回 err
    }
    callback(null, data);
}

function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;

    this.getArticleInfo = getArticleInfo;
}
module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
    var post = this.getArticleInfo();
    openMongoDB(function(collection){
        collection.insert(post, {
            safe: true
        }, function (err) {
            operationCallBack(err, {}, callback);
        });
    });
};

//读取文章及其相关信息
Post.get = function(name, callback) {
    openMongoDB(function(collection){
        var query = {};
        if (name) {
            query.name = name;
        }
      //根据 query 对象查询文章
        collection.find(query).sort({ time: -1 }).toArray(function (err, docs) {
            operationCallBack(err, docs, callback);
        });
    });
};

Post.remove = function(condition, callback) {
    openMongoDB(function(collection){
        collection.deleteOne(condition, function(err) {
            operationCallBack(err, {}, callback);
        });
    });
};

Post.find = function(id, callback) {
    openMongoDB(function(collection){
        var query = {};
        if (id) {
            query.id = id;
        }
        collection.find(query).toArray(function (err, docs) {
           operationCallBack(err, docs, callback);
        });
    });
};

Post.prototype.modify = function(id, callback) {
    var post = this.getArticleInfo();
    openMongoDB(function(collection){
        var query = {};
        if (id) {
            query.id = id;
        }
        collection.update(query, post, function(err) {
           operationCallBack(err, {}, callback);
        });
    });
};
