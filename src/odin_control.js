const DEF_API_VERSION = '0.1';

class AdapterEndpoint
{
    constructor(adapter, endpoint_url, api_version=DEF_API_VERSION)
    {
        this.adapter = adapter;
        this.api_version = api_version;

        if (endpoint_url) {
            this.base_url = `${endpoint_url}/api/${this.api_version}`;
        }
        else {
            this.base_url = `api/${this.api_version}`;
        }
    }

    build_url(path)
    {
        return `${this.base_url}/${this.adapter}/${path}`;
    }

    async get_adapters()
    {
        const url = `${this.base_url}/adapters`;
        const result = await this.get_url(url);
            return result;
    }

    async get(path='')
    {
        const url = this.build_url(path);
        const result = await this.get_url(url);
        return result;
    }

    async get_url(url='')
    {
        const response = await fetch(
            url,
            {
                method: 'GET',
                headers: {'Accept': 'application/json'},
                mode: 'cors'
            }
        );

        if (!response.ok) {
            var message;
            try {
                const err_result = await response.json();
                message = err_result.error;
            }
            catch
            {
                message = `GET request to ${url} failed with status ${response.status}`;
            }
            throw new Error(message);
        }
        const result = await response.json();
        return result;
    }

    async put(data, path='')
    {
        const url = this.build_url(path);
        const response = await fetch(
            url,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            var message;
            try {
                const err_result = await response.json();
                message = err_result.error;
            }
            catch
            {
                message = `PUT request to ${url} failed with status ${response.status}`;
            }
            throw new Error(message);
        }
        const result = await response.json();
        return result;
    }

}

export default AdapterEndpoint;