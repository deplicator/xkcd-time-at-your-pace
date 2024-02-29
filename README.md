# xkcd Time - At Your Pace

## Description

Displays [xkcd 1190 Time](http://www.xkcd.com/1190/) in a fun and navigable way.

## Features

### Navigation

Play button plays the frames back at 10 frames per second pausing for 2 seconds on Special Frames,
both of these are adjustable with text boxes next to the play/pause button. Higher speeds benefit
from preloading images first. It should be noted frames per second is not accurate even if all
frames are preloaded.

Play works in reverse now too, just because it seemed like a good idea at the time.

The 'step through frames' will navigate through the frames one at a time. If playing this will
pause.

| button |            description |
| :----- | ---------------------: |
| `\|<`  |    Jump to First Frame |
| `<<`   | Previous Special Frame |
| `<<`   | Previous Special Frame |
| `<`    |         Previous Frame |
| `>`    |             Next Frame |
| `>>`   |     Next Special Frame |
| `>\|`  |     Jump to Last Frame |

The left and right arrow keys work the same as the previous and next frame step through buttons.

Hovering over the image or slider and scrolling with the mouse wheel will navigate through the
frames as well. This will not pause playback. Fun Fact: this was the motivating feature for the
whole project.

There is also an input box below the comic that shows current frame (out of total frames). This
input box can be changed and the comic will move to the current number.

### Special Frames and Voting

Special frames fix one big problem (manual updating of special frames), and introduce a number of
new problems. We are open to ideas, please discuss on github forums.

Special frames are selected by popular vote. The vote calculation is done automatically, but new
special frames won't show up right away (about a 10 minute delay). For a frame to attain special
status it must receive a certain number of votes, and it must have a higher number of votes for it
than against it. The exact numbers for this are still being determined.

Most special frames are frames with text. The auto play pauses on special frames, so vote for frames
you'd want to pause on.

There is a panel below the comic that can be opened to see all the special frames.

**Debated Frames** are frames that have received a number of both yes and no votes.

### Image Difference

When the site started getting a level of traffic that was hard for the server to handle, the images
were changed to pull from xkcd.com instead of the local frame data. This causes problems with cross
domain contamination of the canvas elements. For now image difference has been changed so that if
the frameDiff url variable is found it will pull images from the local server and work as expected.

### Previous Frame Difference

Shows the new pixels in green and removed pixels in red when compared to previous frame.

#### Image Difference From Frame

Same as above, except shows difference from a chosen frame.

### Share Links

The text box below the slide bar allows for linking directly to a frame. The short bitly link only
works for a normal frame link.

There is an option to link frame differences.

A couple of examples:

[Shows increase in sea level from maximum zoom to before
fading](http://geekwagon.net/projects/xkcd1190?frame=890&framediff=217): `?frame=890&framediff=217`

[Shows scale difference before and after
zoom](http://geekwagon.net/projects/xkcd1190?frame=162&framediff=126): `?frame=162&framediff=126`

### Preloading

[MaPePeR](https://github.com/MaPePeR) has outdone himself by adding code that preloads images for
quicker playback. Clicking "Preload All" twice will load every image in the comic. The preloader
also loads five frames ahead and three frames behind the current frame. In the preload indicator
each frame is represented by 5 square pixels, the width is equal to 100 frames.

| Box Color     | Definition                                  |
| :------------ | ------------------------------------------- |
| Grey          | Frame not loaded                            |
| Blue          | Frame is loading                            |
| Black         | Frame is loaded                             |
| Red           | Something has gone wrong loading that frame |
| Yellow Border | Special Frame                               |
| Green Border  | Current Frame                               |

### Mobile Version

There is now a simplified mobile version at
[http://geekwagon.net/projects/xkcd1190/mobile](http://geekwagon.net/projects/xkcd1190/mobile). In
theory mobile devices should be redirected.

Note: Frame difference isn't set up to work in the mobile version, but frame difference links will
still take you to the selected frame.

### Old Version

The old, pre-database version is still up and running at
<http://geekwagon.net/projects/xkcd1190_old>. It now runs frame updates every 10 minutes instead of
5, but it will not be maintained.

## Guidelines

By no means written in stone, but because of the frame 1236/1237 oddity it was time to make some
guidelines.

- Distinct hashes can stay despite what the image shows.
- Frame numbers are put numerical sequence regardless of what time they are captured (added for the
  frame ~2440 meteor strike that occurred at odd times).

So far, no hash seems to have been intentionally repeated. Hashes that have repeated are usually do
to an error on the serving end or in our script. New hashes almost always occur on the hour unless
there is a server problem. Most of these oddities can be seen in the log file and be corrected
manually. In the case of 1236/1237 everything was running as normal, no oddities in the log. In
accordance with this guideline we just made up, for the time being, we're keeping it as it is.

The meteor strike happened at an off hour, but these were new hashes and still made sense when
viewed in order, so we're counting them as new frames.

## Thanks

- Big thanks to [MaPePeR](https://github.com/MaPePeR) for contributing code (more than me now). It's
  been nice having someone so knowledgeable to work with.
- Thanks to [Aaron Schrab](https://github.com/aschrab) gave you cookies that take you to the last
  frame viewed.
- Thanks to [Rob Smith](https://github.com/kormoc) for the preload indicator.
- Thanks to the other contributors who have helped me keep up with special frames (it's getting to
  be a long list).
- Thanks to everyone who has pointed out bugs, errors, feature requests, and so on; you've helped
  make this site better!
- Thanks for the positive feedback I've gotten from this project. It's been fun to work on a project
  people appreciate.

## A Friendly Reminder

xkcd is licensed by [Randall Munroe](http://www.xkcd.com/about/) under a [Creative Commons
Attribution-NonCommercial 2.5 License](http://www.xkcd.com/license.html ), so please give credit
where it is due (because he's a cool guy as far as I know from being a regular reader of his comic).

The code here, on the other hand, has [an "awful" license](http://geekwagon.net/ufl/license.txt).

If you feel compelled to give away money there is a donation link that will take you to one of a few
donation pages (it's random).

- [Wikimedia Foundation](http://wikimediafoundation.org/wiki/Ways_to_Give) - knowledge without ads!
- [World Wild
  Life](https://support.worldwildlife.org/site/SPageServer?pagename=donate_to_charity&s_src=AWE1302GD914
  ) - For the animal lovers.
- [World Make a Wish](http://worldwish.org/en/donate/index.php) - because these guy do awesome
  things.
- [xkcd store](http://store.xkcd.com/) - not a non-profit, but if you buy stuff from there comics
  will keep coming.

I choose global organizations (sorry US Vets and NPR, I support you both), but the point is there
are plenty of great people to give a little money to.

---

## Change Log

| Date         | Version       | Description                                  |
| ------------ | ------------- | -------------------------------------------- |
| 2013-05-30   | 2.1.something | Started keeping a change log and added tags. |
| past         | 2.0           | Moved to a database.                         |
| farther back | 1.0           | Made a website.                              |

---

## Some notes

Because I can't remember anything.

### Known bugs

- Sometimes when clicking on a vote button the preload indicator goes weird.

### Potential Features

- more cookie options
  - Button to clear all cookies
  - cookie to set which frame to show; newest, last seen, or first.
  - Remember open or closed state of optional panels (frame data and multi frame views).
- vote feature
  - mass vote - show past 24 frames and a yay or nay check box, submit all at once.
  - lock voting on frames when a number of votes is met.
  - lock voting on frames over a particular age.
  - show daily votes per user (this done my IP, so it might be interesting in coffee shops).
- frame stats panel
  - Show how many yay and nay votes a frame has.
  - Show locked/unlocked vote status

### Database

- database name: xkcd1190ayop

#### table: frames

| column  | description                               |
| ------- | ----------------------------------------- |
| update  | timestamp of last time record was updated |
| frame   | frame number of image                     |
| link    | link to xkcd image                        |
| llink   | link to local image                       |
| blink   | bitly short url to frame                  |
| special | Boolean to mark frame as special          |

#### table: votes

| column  | description                           |
| ------- | ------------------------------------- |
| frame   | image frame (one to one)              |
| voteyes | total votes in favor of special frame |
| voteno  | total votes against special frame     |

#### table: voters

| column    | description                |
| --------- | -------------------------- |
| timestamp | last time vote was cast    |
| ip        | track voters by IP         |
| votes     | number of votes cast by IP |

### Requirements

- PHP 5.4+
- Database (MySQL)
- php-curl
- php-gd

### Local Setup

- Copy config-example.php to config.php and set database values correctly.
- Import data/xkcd1190ayop_2013-06-02.sql into the database
- mkdir data/frames
- php downloadFrames.php
- Cron php updateFrame.php every 30 minutes
- chmod 777 data/cache.json
