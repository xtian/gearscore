extern crate reqwest;
extern crate serde;
extern crate serde_json;

use std::collections::HashMap;
use std::env;

use serde::Deserialize;

#[derive(Deserialize)]
struct AccessTokenResponse {
    access_token: String,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client_id = env::var("CLIENT_ID").expect("CLIENT_ID required");
    let client_secret = env::var("CLIENT_SECRET").expect("CLIENT_SECRET required");

    let mut args = env::args().skip(1);
    let region = args.next().expect("Region required");
    let realm = args.next().expect("Realm required");
    let name = args.next().expect("Name required");

    let url = format!(
        "https://us.battle.net/oauth/token\
         ?grant_type=client_credentials&client_id={client_id}&client_secret={client_secret}",
        client_id = client_id,
        client_secret = client_secret
    );

    let access_token_response: AccessTokenResponse = reqwest::get(&url)?.json()?;

    let url = format!(
        "https://{region}.api.blizzard.com/wow/character/{realm}/{name}\
         ?access_token={access_token}&locale=en_US&fields=items",
        access_token = access_token_response.access_token,
        region = region,
        realm = realm,
        name = name
    );

    let character_response: String = reqwest::get(&url)?.text()?;

    println!("{:#?}", character_response);

    Ok(())
}
