import http from "http";
export function fetch(config: { host, port, path }) {
    //https://nodejs.org/api/http.html  
    //     const postData = JSON.stringify({
    //         'query': `
    // {
    //     __schema {
    //       types{
    //         name
    //       }
    //     }
    //   }
    // `
    //     });
    return async (postData: string): Promise<Buffer[]> => {

        return new Promise((resolve, reject) => {
            let body: Buffer[] = []
            const request = http.request({
                host: config.host,
                path: config.path,
                port: config.port,
                method: 'POST',
                headers: { "Content-Type": "application/json" }
            }, res => {
                // res.setEncoding('utf8');
                // res.resume();
                res.on('data', (chunk: Buffer) => {
                    // console.log('typeof chunk:', typeof chunk)
                    // console.log(`******response Graphql: ${chunk}`);
                    body.push(chunk)

                });

                res.on('end', () => {
                    if (!res.complete) {
                        reject('*****The connection was terminated while the message was still being sent')
                        console.error(
                            '*****The connection was terminated while the message was still being sent'
                        )
                    }
                    else
                        resolve(body)
                })

            })

            request.on('error', (e) => {
                reject(e)
            })
            request.write(postData);

            request.end()
        })

    }
}