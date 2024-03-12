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

If you have not yet done so, copy `.env.example` to `.env` and select a LONG_DATA_SOURCE of either "json" or "csv"

For "json", copy a result JSON output file from nuclei into ./data/findings.json (You may need to wrap the JSONLines output into an array to make it a proper JSON file)

For "csv", copy a result csv file from a nucleearpond athena query to data/findings.csv

You will then need to run the mysql database via `docker compose`. copy the `EXAMPLE-docker-compose.yml` to `docker-compose.yml` and change the root and controlrod passwords.

Finally, update the `.env` file with the password you have created.

## Nginx reverse proxy

If you want to host this via nginx and expose the local dev port to external hosts, an example config file is contained in this repo at `example-nginx-config/sites-available`.

First install nginx, then copy this file into `/etc/nginx/sites-available/default`

Also, copy `example-nginx-config/snippets/*` to `/etc/nginx/snippets/`

run the following in a root shell:

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt
openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
ufw allow 'Nginx Full'
ufw delete allow 'Nginx HTTP'
nginx -t
```

If there is no error, follow with
```
systemctl restart nginx
```

Finally run the following 

# Disclosure Template

In the `/artifacts` directory, there is a disclosure_template.docx file which contains a basic disclosure template with various `{field}` tags. This can be edited with your team's logo, letterhead, formatting to allow for quick generation of disclosure notices of a particular finding.
