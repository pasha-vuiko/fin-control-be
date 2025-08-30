import { AppExceptionFlowRegistryOutput } from '@shared/modules/error/interfaces/exception-flow-registry-output.interface';

// Function to generate HTML using template strings
// eslint-disable-next-line max-lines-per-function
export function getAppExceptionDocHtml(errors: AppExceptionFlowRegistryOutput[]): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error Documentation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 20px;
            }
            h1, h2, h3 {
                border-bottom: 1px solid #ddd;
                padding-bottom: 0.3em;
                margin-top: 1em;
                margin-bottom: 0.3em;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f4f4f4;
            }
        </style>
    </head>
    <body>
        <h1>Error Documentation</h1>

        ${errors
          .map(
            group => `
            <h2>${group.name} (Code: ${group.code})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${group.exceptions
                      .map(
                        exception => `
                        <tr>
                            <td>${exception.code}</td>
                            <td>${exception.description}</td>
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>
        `,
          )
          .join('')}

    </body>
    </html>
    `;
}
