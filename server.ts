import { TwitterApi } from './API/TwitterApi';

const twitterApi: TwitterApi = new TwitterApi();
//youtube thumbnail url
//https://img.youtube.com/vi/<insert-youtube-video-id-here>/default.jpg

(

    async () => {

       
        twitterApi.getLikedTweets();
    }
)();
