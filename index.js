var { SiteChecker } = require("broken-link-checker");
var brokenUrlList = [];

const defaultBaseUrlList = [
   "https://nodejs.dev/en/"
]

async function main() {

    async function urlChecker(url) {

        await new Promise(resolve => {

            const htmlUrlChecker = new SiteChecker(
                {
                    excludeInternalLinks: false,
                    excludeExternalLinks: false,
                    excludedKeywords: ['*linkedin*'],
                    filterLevel: 0,
                    acceptedSchemes: ["http", "https"],
                    requestMethod: "get"
                },
                {
                    "error": (error) => {
                        console.error(error);
                    },
                    "link": (result) => {
                        try {
                            let brokenLink = `${result.http.response.statusCode} => ${result.url.resolved}`;
                            console.log(brokenLink);

                            if (result.broken) {
                                if (result.http.response && ![undefined, 200].includes(result.http.response.statusCode)) {

                                    var urlCrawlResult = new Object();
                                    urlCrawlResult.status = result.http.response.statusCode;
                                    urlCrawlResult.url = result.url.resolved;
                                    urlCrawlResult.htmlBaseUrl = result.base.original;
                                    urlCrawlResult.statusMessage = result.http.response.statusMessage;

                                    brokenUrlList.push(urlCrawlResult);
                                }
                            }
                        } catch (error) {
                            console.log(error)
                        }

                    },
                    "end": () => {
                        console.log("base url check completed..");
                        resolve();
                    }
                }
            );

            try {
                htmlUrlChecker.enqueue(url);

            } catch (error) {
                console.log(error)
            }

        });
    }

    async function checkAndGetResults() {

        for (let baseUrl of defaultBaseUrlList) {
            await urlChecker(baseUrl);
        }

        await new Promise(resolve => {
            if (brokenUrlList.length > 0)
            {
                brokenUrlList.forEach(url => {
                    let message = "\nurl is: " + url.url + "\n"
                        + "html base url is: " + url.htmlBaseUrl + "\n"
                        + "status message is: " + url.statusMessage + "\n"
                        + "status is: " + url.status + "\n";
    
                     console.log(message);   
                });
            }
            else
            {
                console.log("\nJob Completed.. There is no broken links!!")
            }

            resolve();
        });
    }

    async function executeJob() {
        await checkAndGetResults();
        process.exit(0);
    };

    executeJob();
}

main(...process.argv.slice(2));