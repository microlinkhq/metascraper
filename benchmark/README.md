
# Comparison

To give you an idea of how accurate **Metascraper** is, here is a comparison of similar libraries:

| Library   | `metascraper` | `html-metadata` | `node-metainspector` | `open-graph-scraper` | `unfluff`   |
| :-------- | :------------ | :-------------- | :------------------- | :------------------- | :---------- |
| Correct   | **95.54%**    | **74.56%**      | **61.16%**           | **66.52%**           | **70.90%**  |
| Incorrect | 1.79%         | 1.79%           | 0.89%                | 6.70%                | 10.27%      |
| Missed    | 2.68%         | 23.67%          | 37.95%               | 26.34%               | 8.95%       |

A big part of the reason for **Metascraper**'s higher accuracy is that it relies on a series of fallbacks for each piece of metadata, instead of just looking for the most commonly-used, spec-compliant pieces of metadata, like Open Graph. However, **Metascraper** is specifically targetted at parsing article information, which is why it's able to be more highly-tuned than the other libraries for that purpose.

_Note: this comparison was run against [32 sites](/support/comparison/urls.js) and last updated on June 1, 2016. If you're interested, you can check out the [full results for each library](/support/comparison/results)._

And here is the accuracy of each individual piece of metadata:

###### `author`

| Library   | `metascraper` | `html-metadata` | `node-metainspector` | `open-graph-scraper` | `unfluff`   |
| :-------- | :------------ | :-------------- | :------------------- | :------------------- | :---------- |
| Correct   | **87.50%**    | **31.25%**      | **31.25%**           | **0.00%**            | **34.38%**  |
| Incorrect | 9.38%         | 3.13%           | 3.13%                | 31.25%               | 50.00%      |
| Missed    | 3.13%         | 65.63%          | 65.63%               | 68.75%               | 15.63%      |

_An `author` is incorrect if it's not in the format of `First Last`, or has extra junk information in the string._

###### `date`

| Library   | `metascraper` | `html-metadata` | `node-metainspector` | `open-graph-scraper` | `unfluff`   |
| :-------- | :------------ | :-------------- | :------------------- | :------------------- | :---------- |
| Correct   | **87.50%**    | **21.86%**      | **0.00%**            | **0.00%**            | **59.38%**  |
| Incorrect | 0.00%         | 3.13%           | 0.00%                | 0.00%                | 18.75%      |
| Missed    | 12.50%        | 75.00%          | 100.00%              | 100.00%              | 15.63%      |

_A `date` is correct if it's the correct date, regardless of time. A `date` is incorrect if it's not in the [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format._

###### `description`

| Library   | `metascraper` | `html-metadata` | `node-metainspector` | `open-graph-scraper` | `unfluff`   |
| :-------- | :------------ | :-------------- | :------------------- | :------------------- | :---------- |
| Correct   | **96.88%**    | **90.63%**      | **96.88%**           | **93.75%**           | **90.63%**  |
| Incorrect | 3.13%         | 3.13%           | 3.13%                | 3.13%                | 3.13%       |
| Missed    | 0.00%         | 6.25%           | 0.00%                | 3.13%                | 6.25%       |

_A `description` is correct if it's either the description the publisher chose, or the first paragraph of the article._

###### `image`

| Library   | `metascraper` | `html-metadata` | `node-metainspector` | `open-graph-scraper` | `unfluff`   |
| :-------- | :------------ | :-------------- | :------------------- | :------------------- | :---------- |
| Correct   | **100.00%**   | **100.00%**     | **100.00%**          | **100.00%**          | **100.00%** |
| Incorrect | 0.00%         | 0.00%           | 0.00%                | 0.00%                | 0.00%       |
| Missed    | 0.00%         | 0.00%           | 0.00%                | 0.00%                | 0.00%       |

_An `image` is correct if it's either the image the publisher chose, or the first image on the page._

###### `publisher`

| Library   | `metascraper` | `html-metadata` | `node-metainspector` | `open-graph-scraper` | `unfluff`   |
| :-------- | :------------ | :-------------- | :------------------- | :------------------- | :---------- |
| Correct   | **96.88%**    | **81.25%**      | **0.00%**            | **78.13%**           | **81.25%**  |
| Incorrect | 0.00%         | 0.00%           | 0.00%                | 12.50%               | 0.00%       |
| Missed    | 3.13%         | 18.75%          | 100.00%              | 6.25%                | 18.75%      |

_A `publisher` is correct if it's the publisher's proper name, or the publisher's domain name._

###### `title`

| Library   | `metascraper` | `html-metadata` | `node-metainspector` | `open-graph-scraper` | `unfluff`   |
| :-------- | :------------ | :-------------- | :------------------- | :------------------- | :---------- |
| Correct   | **100.00%**   | **100.00%**     | **100.00%**          | **100.00%**          | **100.00%** |
| Incorrect | 0.00%         | 0.00%           | 0.00%                | 0.00%                | 0.00%       |
| Missed    | 0.00%         | 0.00%           | 0.00%                | 0.00%                | 0.00%       |

_A `title` is correct if it's the title of the article, or the title of the page._

###### `url`

| Library   | `metascraper` | `html-metadata` | `node-metainspector` | `open-graph-scraper` | `unfluff`   |
| :-------- | :------------ | :-------------- | :------------------- | :------------------- | :---------- |
| Correct   | **100.00%**   | **96.88%**      | **100.00%**          | **93.75%**           | **93.75%**  |
| Incorrect | 0.00%         | 3.13%           | 0.00%                | 0.00%                | 0.00%       |
| Missed    | 0.00%         | 0.00%           | 0.00%                | 6.25%                | 6.25%       |

_A `url` is correct if it resolves back to the original article._

