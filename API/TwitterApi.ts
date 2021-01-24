const gotHttp = require('got');
import * as fs from "fs";
const got = require('got');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
require('dotenv').config()


const oauth = OAuth({
    consumer: {
        key: process.env.CONSUMER_KEY,
        secret: process.env.CONSUMER_SECRET
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
});

const token = {
    key: process.env.TOKEN_KEY,
    secret: process.env.TOKEN_SECRET
};



export class TwitterApi {

    private BearerToken: string;
    private regExTwitterShortUrl: RegExp = new RegExp('(http(s|):|)\/\/(www\.|)t(.*?)(co).+');
    private youtubeRegEx: RegExp = new RegExp('(http(s|):|)\/\/(www\.|)yout(.*?)\/(embed\/|watch.*?v=|)([a-z_A-Z0-9\-]{11})');
    private htmlTitleRegEx: RegExp = new RegExp('(\<title\>)(.+)(\<\/title\>)');
    private getFavouritedTweetsUrl: string = "https://api.twitter.com/1.1/favorites/list.json";


    constructor() {
        try {
            this.BearerToken = process.env.BEARER_TOKEN;
        }
        catch(e){
            console.log(e);
        }
        
    }

    getTweets(tweetId: Array<String>) {

    }

    async TweetsRecur(maxTweetId: number, tweetIdsAnalyzed: number[]) {
        var parentClass = this;
        let getLikedTweetsUrl: string = `${this.getFavouritedTweetsUrl}?count=200&screen_name=StoicDream&max_id=${maxTweetId}`;
        const { body } = await gotHttp(getLikedTweetsUrl, {
            responseType: 'json',
            headers: {
                'Authorization': `Bearer ${this.BearerToken}`
            }
        });
        if (body.length == 0) {
            return;
        }
        body.forEach(function (tweetData) {
            if (tweetIdsAnalyzed.indexOf(tweetData.id) >= 0) {

            }
            else {
                tweetIdsAnalyzed.push(tweetData.id)
                if (tweetData.entities.urls.length > 0) {
                    tweetData.entities.urls.forEach(function (urlData) {
                        let youtubeHtml = parentClass.parseUrlForYoutube(urlData.expanded_url);
                        console.log(youtubeHtml)
                    });
                }
            }

        })

        let maxId = tweetIdsAnalyzed[tweetIdsAnalyzed.length - 1];
        await this.TweetsRecur(maxId, tweetIdsAnalyzed);
    }



    async getUserTweetTimeline() {
        const url = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
        try {
            const { body } = await got(url, {
                headers: oauth.toHeader(oauth.authorize({ url, method: 'GET' }, token)),
                responseType: 'json'
            });
        }
        catch (e) {

        }
    }
    async getLikedTweets() {
        try {
            fs.writeFile('youbtube.html', '<html>', function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("File created!");
            });

            let sinceId: number = 1317717228893208576;
            let tweetIdsAnalyzed: number[] = [];
            await this.TweetsRecur(sinceId, tweetIdsAnalyzed);
            fs.appendFile('youbtube.html', '</html>', function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("File created!");
            });
        } catch (e) {
            console.log(e);
        }
        
    }

    private parseUrlForYoutube(redirectUrl, htmlBody = "") : string {
        let youtubeMatches = this.youtubeRegEx.exec(redirectUrl);
        if (youtubeMatches !== null && youtubeMatches.length > 0) {
            let youtubeUrl: string = youtubeMatches[0];
            let youtubeVideoId: string = youtubeMatches[6];
            let titleMatches = this.htmlTitleRegEx.exec(htmlBody);
            let youtubeVideoTitle: string = "";
            if (titleMatches !== null && titleMatches.length > 0) {
                youtubeVideoTitle = titleMatches[2];
            }
            
            let youtubeThumbnailString: string = `<iframe width="360" height="145" src="https://www.youtube.com/embed/${youtubeVideoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

            fs.appendFile('youbtube.html', youtubeThumbnailString + '\n', function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("File created!");
            });
            return youtubeThumbnailString;
        }

        return "";
    }
    
    async getTweet(tweetId: String) {
        try {
            const { body } = await gotHttp(`https://api.twitter.com/2/tweets?ids=${tweetId}`, {
                responseType: 'json',
                headers: {
                    'Authorization': `Bearer ${this.BearerToken}`
                }
            });
            if (this.regExTwitterShortUrl.test(body.data[0].text)) {
                let matches: Array<string> = this.regExTwitterShortUrl.exec(body.data[0].text);
                try {
                    let shortUrl: string = matches[0];
                    //const shortResponse = await gotHttp(shortUrl);
                    //let redirectUrl: string = shortResponse.redirectUrls[shortResponse.redirectUrls.length - 1];
                }

                catch (e) {
                    console.log(e);
                }
            }
            
            console.log(body.data);
        }
        catch (e) {
            console.log(e);
        }
    }

}
module.exports = {
    TwitterApi: TwitterApi
};
