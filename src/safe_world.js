const {Wild} = require('./wild.js');
const {MapUtil} = require('./maputil.js');
const {GeoMap} = require('./geomap.js');
const _ = require('lodash');


class Wilds {
  static CRUCIAN = 1
  static PIKE = 2
}


class SafeWorld {
  GM = new GeoMap()
  W = 0
  H = 0
  T = 0
  dead = []
  born = []

  constructor(w, h) {
    this.W = w
    this.H = h
  }


  add_wild(u) {
    return this.GM.add(u)
  }

  roam_wild(u) {
    var spots = MapUtil.get_adj(u.point, this.W, this.H)
    if (!spots || spots.length < 1) {
      return false
    }
    spots = spots.filter(p => !this.GM.get(p))
    if (!spots || spots.length < 1) {
      this.dead.push(u)
      return false
    }

    var spot = _.sample(spots)
    var old_spot = u.point
    var rc = this.GM.move(old_spot, spot)
    if (rc) {
      u.point = spot
    }
    return rc;
  }

  remove_wild(u) {
    return this.GM.remove(u.point)
  }

  start() {
    this.T = 0

    var w = new Wild(Wilds.CRUCIAN)
    w.move([this.W/2, this.H/2])
    this.add_wild(w)
  }

  next() {
    this.T++
    this.dead = []
    var all = this.GM.get_vals()
    all.forEach(c => this.roam_wild(c))
    this.dead.forEach(c => this.remove_wild(c))
    all = this.GM.get_vals()

    this.born = []
    all.forEach(c => this.breed(c))
  }

  status() {
    console.log(this.T, ";", this.GM.get_vals().length, ";", this.born.length, ";", this.dead.length)
  }

  breed(u) {
    var spots = MapUtil.get_adj(u.point, this.W, this.H)
    if (!spots || spots.length < 1) {
      return false
    }
    var free = spots.filter(p => !this.GM.get(p))
    if (free.length < spots.length) {
      return false
    }

    var spot = _.sample(spots)
    if (!spot)
      return false

    var born = new Wild(u.kind)
    born.move(spot)
    this.add_wild(born)
    this.born.push(born)
    return true
  }
}

module.exports = {SafeWorld, Wilds}
