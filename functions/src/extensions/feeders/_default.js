const mustache = require('mustache');

const config = require('../../config');
const songsProvider = require('../../provider/songs');
const { debug } = require('../../utils/logger')('ia:feeder:default');
const rebornEscape = require('../../utils/reborn-escape');

class DefaultFeeder {
  build ({ app, query, playlist }) {
    throw new Error('Not Implemented!');
  }

  /**
   * Do we have any songs here?
   *
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  isEmpty ({ app, slots, playlist }) {
    return playlist.isEmpty(app);
  }

  /**
   * Current item of feeder
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {{id: string, title: string}}
   */
  getCurrentItem ({ app, playlist }, type = 'current') {
    return playlist.getCurrentSong(app);
  }

  /**
   * Do we have previous item?
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasPrevious ({ app, slots, playlist }) {
    if (playlist.isLoop(app)) {
      return true;
    }

    return playlist.hasPreviousSong(app);
  }

  /**
   * Do we have next item?
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasNext ({ app, slots, playlist }) {
    if (playlist.isLoop(app)) {
      return true;
    }

    return playlist.hasNextSong(app);
  }

  /**
   * Move to the next song
   *
   * TODO: should be async because we could have multiple albums here
   *
   * @param ctx
   * @param move
   * @returns {Promise.<T>}
   */
  next (ctx, move = true) {
    const { app, playlist } = ctx;
    if (move) {
      debug('move to the next song');
      playlist.next(app);
    }
    return Promise.resolve(ctx);
  }

  /**
   * Move to the previous song
   *
   * TODO: should be async because we could have multiple albums here
   *
   * @returns {Promise.<T>}
   */
  previous (ctx) {
    const { app, playlist } = ctx;
    debug('move to the previous song');
    playlist.previous(app);
    return Promise.resolve(ctx);
  }

  /**
   * Process album songs
   *
   * @protected
   * @param album
   * @returns {Array}
   */
  processAlbumSongs (album) {
    return album.songs
      .map((song, idx) => Object.assign({}, song, {
        audioURL: songsProvider.getSongUrlByAlbumIdAndFileName(
          album.id, rebornEscape(song.filename)),
        collections: album.collections,
        coverage: album.coverage,
        creator: album.creator,
        imageURL: mustache.render(config.media.POSTER_OF_ALBUM, album),
        // TODO : add recommendations
        suggestions: ['Next'],
        album: {
          id: album.id,
          title: album.title,
        },
        track: idx + 1,
        year: album.year,
      }));
  }
}

module.exports = DefaultFeeder;
