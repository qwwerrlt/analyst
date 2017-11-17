db.host_weight.aggregate([{
  $group: {
    _id: null,
    total: {$sum: {$ifNull: ['$dailyPV', 0]}}
  }
}, {
  $limit: 1
}]).forEach(function(doc) {
  var total = doc.total;
  print('total:', total);
  db.host_weight.find().snapshot().forEach(function(host_weight) {
    var dailyPV = host_weight.dailyPV;
    var weight = dailyPV / total;
    printjson({host: host_weight.host, dailyPV: dailyPV, weight: weight});
    db.host_weight.update({_id: host_weight._id}, {$set: {weight: weight}});
  });
});
