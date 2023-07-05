# Control Rod

A front end for [Nuclei](https://github.com/projectdiscovery/nuclei) and [Nuclear Pond](https://github.com/DevSecOpsDocs/nuclearpond)

# Getting Started

## Authentication

This app is based on the [T3 App](https://create.t3.gg/) and configured for the data APIs to be protected.

To get _some_ sort of auth working, check out the `Authentication` section at [T3 First Steps](https://create.t3.gg/en/usage/first-steps)

Discord authentication is easy to implement and recommended for local development.

After setting up auth, make sure you run `npx prisma db push` on a fresh install. This will create the authentication database.

## Nuclearpond / s3 / athena

If you are deploying to an instance with [Nuclear Pond's Terraform Module](https://github.com/DevSecOpsDocs/terraform-nuclear-pond) deployed, set the following in your .env:

```
LONG_DATA_SOURCE="athena"
AWS_BUCKET_NAME=nuclearpond-instance-name-artifacts
```

And specify your artifacts bucket name in the AWS_BUCKET_NAME value.

## Local File Based / Developer Mode

If you are NOT deploying to a cloud environment, or do not wish to use s3/athena, leave set LONG_DATA_SOURCE to either "json" or "csv"

For "json", copy a result JSON output file from nuclei into ./data/findings.json (You may need to wrap the JSONLines output into an array to make it a proper JSON file)

For "csv", copy a result csv file from a nucleearpond athena query to data/findings.csv

# Disclosure Template

In the `/artifacts` directory, there is a disclosure_template.docx file which contains a basic disclosure template with various `{field}` tags. This can be edited with your team's logo, letterhead, formatting to allow for quick generation of disclosure notices of a particular finding.
