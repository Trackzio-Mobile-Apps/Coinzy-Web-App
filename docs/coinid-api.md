<!-- Source: https://coinid-api-docs.surge.sh/README.md | Saved: 2026-10-05 | Auth login/signup/password-reset payloads are not included in this source. -->

# Coin Identification Backend API Documentation

> Base URL: http://coins-api.trackzio.com/api

## Authentication

All endpoints require JWT authentication. Include the JWT token in the `Authorization` header as a Bearer token.

## Endpoints

### AI Identification

#### `POST /ai/identify`

- **Description**: Identify the coin from uploaded images. This endpoint returns raw identification data without adding a new coin automatically.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Body**: Multipart form data with an array of 2 image files in the field `files`
- **Response Examples**:
  - `200 OK`: Identification successful, returns the identified coin data.
    ```json
    {
      "error": false,
      "data": {
          "name": "One Half Penny",
          "currency": "Australian Pound",
          "issuer": "Commonwealth of Australia",
          "yearOfMinting": "1916",
          "ruler": "George V - United Kingdom",
          "shape": "Round",
          "rarity": "COMMON",
          "estimatedPrice": 2.5,
          "weightGrams": 3.56,
          "diameterMm": 20,
          "thicknessMm": 1.2,
          "material": "Bronze",
          "edgeType": "Plain",
          "technique": "Struck",
          "mintMark": null,
          "frontDesign": "Profile portrait of King George V",
          "backDesign": "Commonwealth of Australia. ONE HALF PENNY. 1916",
          "inscriptions": "GEORGE V KING EMPEROR. COMMONWEALTH OF AUSTRALIA. ONE HALF PENNY. 1916",
          "strikesAndDents": null,
          "context": "Part of the Australian currency system during the reign of King George V",
          "mintLocation": null,
          "inCirculation": false,
          "condition": 3,
          "wearAndTearAnalysis": "Minor wear is visible.",
          "lusterAndSurfaceQuality": "Dull",
          "imageUrls": [
              "https://progresspal-assets.s3.us-west-2.amazonaws.com/coin-hxtkqv58b2utvbxsv9h3vpib.jpg",
              "https://progresspal-assets.s3.us-west-2.amazonaws.com/coin-tiefyfudi876u32pspixo0r9.jpg"
          ],
          "archetypeId": "67e55615c3e206064786ffa0"
        }
      }
    ```
  - `400 Bad Request`: No files uploaded or invalid file type/size.
    ```json
    {
      "error": true,
      "reason": "File must be an image (jpeg, png, gif)"
    }
    ```
  - `500 Internal Server Error`: Identification failed.
    ```json
      {
        "error": true,
        "reason": "Internal Server Error"
      }
      ```


  - **AI SPECIFIC ERRORS:**
    > Some of the errors are specific to the AI service. Those responses will include an additional `aiErrorCode` field (see below for list), which can be helpful for debugging.
    ```json
    {
      "error": true,
      "aiErrorCode": "E001",
      "reason": "The image doesn't contain any coin"
    }
    ```
    ```json
    {
        "error": true,
        "aiErrorCode": "E004",
        "reason": "AI call limit exceeded for free plan",
        "resetsAt": 1741335934674
    }
    ```

      | AI Error Code | HTTP Status Code | Description |
      |---------------|------------------|-------------|
      | E001          | 500              | Not a Coin. |
      | E002          | 500              | Image too blurry. |
      | E003          | 500              | Any other (generic) error. |
      | E004          | 403              | AI Usage limit exceeded |
      | E005          | 500              | Both the images are for either back or front of a coin                                 only, OR are of different coins alltogether |

#### `POST /ai/identify-v2`

- **Description**: Identify the coin from uploaded images and return multiple similar archetype matches.
- **Query Parameters**:
  - `matchCount` (optional): Number of similar matches to return (default: 5)
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Body**: Multipart form data with an array of 2 image files in the field `files`
- **Response Examples**:
  - `200 OK`: Identification successful, returns an array of matches and image URLs.
    ```json
    {
        "error": false,
        "data": {
            "imageUrls": [
                "https://progresspal-assets.s3.us-west-2.amazonaws.com/coin-f5ewc9nq3u16u226g4vqk2pj.jpg",
                "https://progresspal-assets.s3.us-west-2.amazonaws.com/coin-i8tjan4hv8iedluc0pp5494v.jpg"
            ],
            "matchesFoundCount": 5,
            "matches": [
                {
                    "name": "5 Paise",
                    "currency": "Indian Rupee",
                    "issuer": "India",
                    "yearOfMinting": "1962",
                    "ruler": "Republic (1950-date)",
                    "shape": "Square with rounded corners",
                    "rarity": "COMMON",
                    "estimatedPrice": {
                        "G": "0.02-0.11",
                        "VG": "0.10-0.27",
                        "F": "0.18-0.49",
                        "VF": "0.12-0.55",
                        "XF": "0.24-0.75",
                        "AU": "0.25-0.75",
                        "UNC": "0.50-9.30"
                    },
                    "weightGrams": 1.6,
                    "diameterMm": null,
                    "thicknessMm": 2.2,
                    "material": "Aluminium",
                    "edgeType": "Plain",
                    "technique": "Milled",
                    "mintMark": null,
                    "frontDesign": "Ashoka Lion Capital.",
                    "backDesign": "Denomination, date below.",
                    "inscriptions": "Obverse: भारत INDIA Reverse: रुपये का बीसवाँ भाग 5 पाँच पैसे 1971 B",
                    "strikesAndDents": null,
                    "context": "Different National Emblem Types in KM#18.x mintages. Type 1: Side lions toothless with 2 to 3 furrows, short squat D in INDIA. Pedestal 8.98mm wide. Type 2: Asoka lion pedestal more imposing. Side lions with 3 or 4 furrows, more elegant D in INDIA. The shape of the D in INDIA is the easiest way to distinguish this obverse. Pedestal 9.35mm wide. Difference between KM#18.1 and KM#18.2 Different types of reverse, KM#18.1 - KM#18.3 with Devanagari legend above value (similar to KM#17); KM#18.4 - KM#18.6 without a legend and with larger '5' in denomination. Bombay mintmarks: ♦ - Circulation strikes B - Proof strikes Different sizes of denomination letters and numeral in KM#18.x exist.",
                    "mintLocation": null,
                    "inCirculation": false,
                    "condition": null,
                    "wearAndTearAnalysis": null,
                    "lusterAndSurfaceQuality": null,
                    "orientation": "Medal alignment ↑↑",
                    "isDemonetized": true,
                    "archetypeId": "67e558fec3e20606478806ac",
                    "archetypeImageUrls": [
                        "https://en.numista.com/catalogue/photos/inde/2368-180.jpg",
                        "https://en.numista.com/catalogue/photos/inde/3089-180.jpg"
                    ],
                    "matchScore": "93.12%"
                },
                // .............. 4 more ............
            ]
        }
    }
    ```
  - `400 Bad Request`: No files uploaded or invalid file type/size.
    ```json
    {
      "error": true,
      "reason": "File must be an image (jpeg, png, gif)"
    }
    ```
  - `404 Not Found`: No similar archetypes found for the identified coin.
    ```json
    {
      "error": true,
      "aiErrorCode": "E004",
      "reason": "No similar archetypes found for the identified coin"
    }
    ```
  - `500 Internal Server Error`: Identification failed.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

  - **AI SPECIFIC ERRORS:**
    > Some of the errors are specific to the AI service. Those responses will include an additional `aiErrorCode` field (see below for list), which can be helpful for debugging.
    ```json
    {
      "error": true,
      "aiErrorCode": "E001",
      "reason": "The image doesn't contain any coin"
    }
    ```
    ```json
    {
        "error": true,
        "aiErrorCode": "E004",
        "reason": "AI call limit exceeded for free plan",
        "resetsAt": 1741335934674
    }
    ```

      | AI Error Code | HTTP Status Code | Description |
      |---------------|------------------|-------------|
      | E001          | 500              | Not a Coin. |
      | E002          | 500              | Image too blurry. |
      | E003          | 500              | Any (other) generic error. |
      | E004          | 403              | AI Usage limit exceeded |
      | E005          | 500              | Both the images are for either back or front of a coin                                 only, OR are of different coins alltogether |
      | E006          | 500              | No similar archetypes found for the identified coin |

------------------------------------------------------------

### Coin Management

#### `POST /coin/add`

- **Description**: Add a new coin to the private collection manually.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Body**: JSON object with coin details.
    ```json
    {
      "name": "One Half Penny",
      "currency": "Penny",
      "issuer": "Commonwealth of Australia",
      "yearOfMinting": "1916",
      "ruler": "George V",
      "shape": "Round",
      "rarity": "COMMON",
      "estimatedPrice": 2.5,
      "weightGrams": null,
      "diameterMm": null,
      "thicknessMm": null,
      "material": "Bronze",
      "edgeType": null,
      "technique": null,
      "mintMark": null,
      "frontDesign": "Head of King George V",
      "backDesign": "Commonwealth of Australia. One Half Penny. 1916",
      "inscriptions": "GEORGE V KING EMPEROR. COMMONWEALTH OF AUSTRALIA. ONE HALF PENNY. 1916",
      "strikesAndDents": null,
      "context": "",
      "mintLocation": null,
      "inCirculation": false,
      "condition": null,
      "wearAndTearAnalysis": null,
      "lusterAndSurfaceQuality": null,
      "isIdentified": true,
      "isOwned": false,
      "isWishlisted": false,
      "dateAcquired": null,
      "purchasePrice": null,
      "notes": "",
      "imageUrls": [
        "https://example-bucket.s3.amazonaws.com/coin-cie8z0f89kj7sdlqz3fuzep7.jpg",
        "https://example-bucket.s3.amazonaws.com/coin-w2qeoe81orkufc6kiru8p8q6.jpg"
      ],
      "rating": 5,
      "comment": "This is a nice coin!",
      "archetypeId": "67e55615c3e206064786ffa0",
      "_collection": "6ac757fa79755889ca446c74"
    }
    ```
    > **NOTE:** To put the coin in a **custom** collection from `POST /collections/add`, send the collection id as **`_collection`** (Mongo ref). Sending `collectionId` is ignored — the coin lands in the auto Identified bucket instead. Omit `_collection` to use the default Identified/Owned routing from `isOwned` / `isIdentified`.
- **Response Examples**:
  - `200 OK`: Coin added successfully.
    ```json
    {
      "error": false,
      "data": {
          "isIdentified": true,
          "isOwned": false,
          "isWishlisted": false,
          "imageUrls": [
              "https://progresspal-assets.s3.us-west-2.amazonaws.com/coin-hxtkqv58b2utvbxsv9h3vpib.jpg",
              "https://progresspal-assets.s3.us-west-2.amazonaws.com/coin-tiefyfudi876u32pspixo0r9.jpg"
          ],
          "name": "One Half Penny",
          "currency": "Australian Pound",
          "issuer": "Commonwealth of Australia",
          "yearOfMinting": "1916",
          "ruler": "George V - United Kingdom",
          "shape": "Round",
          "rarity": "COMMON",
          "estimatedPrice": "2.5",
          "weightGrams": "3.56",
          "diameterMm": "20",
          "thicknessMm": "1.2",
          "material": "Bronze",
          "edgeType": "Plain",
          "technique": "Struck",
          "mintMark": null,
          "frontDesign": "Profile portrait of King George V",
          "backDesign": "Commonwealth of Australia. ONE HALF PENNY. 1916",
          "inscriptions": "GEORGE V KING EMPEROR. COMMONWEALTH OF AUSTRALIA. ONE HALF PENNY. 1916",
          "strikesAndDents": null,
          "context": "Part of the Australian currency system during the reign of King George V",
          "mintLocation": null,
          "inCirculation": false,
          "condition": "3",
          "wearAndTearAnalysis": "Minor wear is visible.",
          "lusterAndSurfaceQuality": "Dull",
          "dateAcquired": null,
          "purchasePrice": null,
          "notes": "",
          "_user": "67c072a0b9700c0db8a99f9a",
          "userId": "67c072a0b9700c0db8a99f9a",
          "_id": "67c8551e9556b07c710fbf72",
          "createdAt": "2025-03-05T13:43:58.670Z",
          "updatedAt": "2025-03-05T13:43:58.670Z",
          "__v": 0,
          "id": "67c8551e9556b07c710fbf72",
          "archetypeId": "67e55615c3e206064786ffa0"
      }
    }
    ```
  - `400 Bad Request`: Missing required fields.
    ```json
    {
      "error": true,
      "reason": "Two image urls must be provided"
    }
    ```
  - `400 Bad Request`: Missing required fields.
    ```json
    {
      "error": true,
      "reason": "`name` is mandatory"
    }
    ```
  - `403 Forbidden`: Threshold for free plan crossed.
    ```json
    {
        "error": true,
        "reason": "Please purchase a plan to add more than 1 coins"
    }
    ```
  - `500 Internal Server Error`: Error adding coin.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

#### `GET /coin/filteritems`

- **Description**: Get possible values of coin properties for filtering.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Query Parameters**: Valid coin property fields.
    | Field Name      | Description                      | Type    |
    |-----------------|----------------------------------|---------|
    | issuer          | Issuer of the coin               | String  |
    | ruler           | Ruler during the coin's minting  | String  |
    | yearOfMinting   | Year the coin was minted         | String  |
    | currency        | Currency of the coin             | String  |
    | shape           | Shape of the coin                | String  |
    | rarity          | Rarity of the coin               | String  |
    | material        | Material of the coin             | String  |
    | edgeType        | Edge type of the coin            | String  |
    | technique       | Technique used to mint the coin  | String  |
    | mintLocation    | Location where the coin was minted| String  |

    > **NOTE 1:** You need to provide the needed fields in the URL as query params, like so:
    `/coin/filteritems?issuer&ruler&yearOfMinting&technique`
    
    > **NOTE 2:** At least one valid field (as listed above, case sensitive) needs to be provided as query param.

- **Response Examples**:
  - `200 OK`: Returns distinct values for the specified fields.
    ```json
      {
          "error": false,
          "data": {
              "issuer": [
                  "Commonwealth of Australia"
              ],
              "ruler": [
                  "George V"
              ],
              "yearOfMinting": [
                  "1916"
              ],
              "technique": [
                  "Milled",
                  "Struck"
              ]
          }
      }
    ```
  - `400 Bad Request`: No valid fields provided.
    ```json
    {
      "error": true,
      "reason": "No valid fields provided"
    }
    ```
  - `500 Internal Server Error`: Error fetching distinct values.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

#### `POST /coin/fetchAll`

- **Description**: Fetch all coins in the private collection with search filters and pagination.

- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Query Parameters**:
    - `pageNo`: Page number (default: 0)
    - `pageSize`: Page size (default: 20)
    - `search`: Search term (optional)

    > **NOTE:** Specifying the `search` term in URL as query param performs a case insensitive text based search on the `name` field of the coins & filters the results accordingly.
  - **Body Example**: JSON object with filter fields.
    ```json
    {
      "issuer": ["Roman Empire"],
      "yearOfMinting": ["100 BC", "110 BC"] // matches any of "100 BC", "110 BC"
      "isOwned": [true],
      "isIdentified": [false],
      "isWishlisted": [false]
      // ...other fields...
    }
    ```
    > **NOTE:** You can specify any of the field names listed below as keys here. The values specified for those key fields must always be an ARRAY which ideally contains the terms received for the respective keys from the `GET /coin/filteritems` endpoint. The results will get filtered accordingly.
    >
    > | Field Name      | Description                         | Type    |
    > |-----------------|-------------------------------------|---------|
    > | issuer          | Issuer of the coin                  | String[]  |
    > | ruler           | Ruler during the coin's minting     | String[]  |
    > | yearOfMinting   | Year the coin was minted            | String[]  |
    > | currency        | Currency of the coin                | String[]  |
    > | shape           | Shape of the coin                   | String[]  |
    > | rarity          | Rarity of the coin                  | String[]  |
    > | material        | Material of the coin                | String[]  |
    > | edgeType        | Edge type of the coin               | String[]  |
    > | technique       | Technique used to mint the coin     | String[]  |
    > | mintLocation    | Location where the coin was minted  | String[]  |
    > | inCirculation   | Whether the coin is in circulation  | Boolean[] |
    > | isOwned         | Ownership status of the coin        | Boolean[] |
    > | isIdentified    | Identification status of the coin   | Boolean[] |
    > | isWishlisted    | Wishlist status of the coin         | Boolean[] |
    > | _collection     | Custom collection id(s)             | String[]  |
    >
    > **NOTE:** `collectionId` is **not** a valid filter (returns `400 Invalid query filter fields`). Use `_collection: ["<id>"]` to list coins in a custom collection. Card thumbnails on `GET /collections/fetchAll` come from `representativeImages` once coins are linked via `_collection`.

- **Response Examples**:
  - `200 OK`: Returns the list of coins (optionally filtered) with pagination info.
    ```json
    {
      "error": false,
      "data": [
        {
          "coinId": "60d21b4667d0d8992e610c85",
          "name": "Ancient Coin",
          "issuer": "Roman Empire",
          "isOwned": false,
          "isIdentified": false,
          "isWishlisted": false,
          "imageUrls": [
            "https://example-bucket.s3.amazonaws.com/coin-12345.jpg"
          ],
          "archetypeId": null,
          "marketplace": {
            "buy": {
              "isAvailable": false,
              "listingCount": 0
            },
            "sale": {
              "isAvailable": false,
              "listingId": null
            }
          }
        }
        // ...other coins...
      ],
      "pagination": {
        "pageNo": 0,
        "pageSize": 20,
        "totalCount": 77
      }
    }
    ```
  - `400 Bad Request`: Invalid filter fields or non-array values.
    ```json
    {
      "error": true,
      "reason": "Invalid query filter fields: invalidField"
    }
    ```
  - `500 Internal Server Error`: Error fetching coins.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

#### `GET /coin/getDetails/:id`

- **Description**: Get details of a particular coin in the private collection.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Coin ID
- **Response**:
  - `200 OK`: Returns the coin details.
    ```json
      {
          "error": false,
          "data": {
              "_id": "67bc4ebd174b601f93977fd2",
              "isIdentified": true,
              "isOwned": false,
              "isWishlisted": false,
              "archetypeId": "56ab5aca284b520e36085eb4",
              "imageUrls": [
                  "https://example-bucket.s3.amazonaws.com/coin-emg86vu4up700uu4m3jmo7jj.jpg",
                  "https://example-bucket.s3.amazonaws.com/coin-xwwg5fwu6w1qsa2x0x1yebya.jpg"
              ],
              "name": "One Half Penny",
              "currency": "Penny",
              "issuer": "Commonwealth of Australia",
              "yearOfMinting": "1916",
              "ruler": "George V",
              "shape": "Round",
              "rarity": "COMMON",
              "estimatedPrice": 2.5,
              "weightGrams": null,
              "diameterMm": null,
              "thicknessMm": null,
              "material": "Bronze",
              "edgeType": null,
              "technique": "Milled",
              "mintMark": null,
              "frontDesign": "Profile of King George V",
              "backDesign": "Commonwealth of Australia, One Half Penny, 1916",
              "inscriptions": "GEORGE V KING EMPEROR, COMMONWEALTH OF AUSTRALIA, ONE HALF PENNY, 1916",
              "strikesAndDents": null,
              "context": "Part of the coinage of Australia during the reign of King George V.",
              "mintLocation": null,
              "inCirculation": false,
              "condition": null,
              "wearAndTearAnalysis": null,
              "lusterAndSurfaceQuality": null,
              "dateAcquired": null,
              "purchasePrice": null,
              "notes": null,
              "_user": "6777d9660b553d904df103fb",
              "userId": "6777d9660b553d904df103fb",
              "createdAt": "2025-02-24T10:49:33.702Z",
              "updatedAt": "2025-02-24T10:49:33.702Z",
              "marketplace": {
                "buy": {
                  "isAvailable": false,
                  "listingCount": 0
                },
                "sale": {
                  "isAvailable": false,
                  "listingId": null
                }
              },
              "archetypeId": null
          }
      }
    ```
  - `500 Internal Server Error`: Error fetching coin details.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

#### `PATCH /coin/update/:id`

- **Description**: Update a particular coin in the private collection.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Coin ID
  - **Body**: JSON object with fields to update.
    ```json
    {
      "isOwned": true,
      "mintMark": "New Mint Mark",
      "frontDesign": "New Front Design"
      // ...other fields...
    }
    ```

    > **NOTE 1:** Only the following fields can be updated via this endpoint:
    >
    > | Field Name      | Description                         | Type    |
    > |-----------------|-------------------------------------|---------|
    > | isOwned         | Ownership status of the coin        | Boolean |
    > | isWishlisted    | Wishlist status of the coin         | Boolean |
    > | dateAcquired    | Date of ownership                   | String    |
    > | purchasePrice   | Cost of ownership                   | String  |
    > | notes           | Ownership notes                     | String  |
    > | weightGrams     | Weight of the coin in grams         | String  |
    > | diameterMm      | Diameter of the coin in millimeters | String  |
    > | thicknessMm     | Thickness of the coin in millimeters| String  |
    > | shape           | Shape of the coin                   | String  |
    > | material        | Material of the coin                | String  |
    > | edgeType        | Edge type of the coin               | String  |

    > **NOTE 2:** All fields mentioned in request body are updated using the sent value in place. So, if you do not wish to edit a field, either send in it's current value OR skip it completely in request body. Sending in it's value explicitly as `null`, `undefined`, or an empty string would have undesirable effects!
  
- **Response Example**:
  - `200 OK`: Coin updated successfully.
    ```json
      {
          "error": false,
          "data": {
              "_id": "67bc4ebd174b601f93977fd2",
              "isIdentified": true,
              "isOwned": false,
              "isWishlisted": false,
              "archetypeId": "56ab5aca284b520e36085eb4",
              "imageUrls": [
                  "https://example-bucket.s3.amazonaws.com/coin-emg86vu4up700uu4m3jmo7jj.jpg",
                  "https://example-bucket.s3.amazonaws.com/coin-xwwg5fwu6w1qsa2x0x1yebya.jpg"
              ],
              "name": "One Half Penny",
              "currency": "Penny",
              "issuer": "Commonwealth of Australia",
              "yearOfMinting": "1916",
              "ruler": "George V",
              "shape": "Round",
              "rarity": "COMMON",
              "estimatedPrice": 2.5,
              "weightGrams": null,
              "diameterMm": null,
              "thicknessMm": null,
              "material": "Bronze",
              "edgeType": null,
              "technique": "Milled",
              "mintMark": null,
              "frontDesign": "Profile of King George V",
              "backDesign": "Commonwealth of Australia, One Half Penny, 1916",
              "inscriptions": "GEORGE V KING EMPEROR, COMMONWEALTH OF AUSTRALIA, ONE HALF PENNY, 1916",
              "strikesAndDents": null,
              "context": "Part of the coinage of Australia during the reign of King George V.",
              "mintLocation": null,
              "inCirculation": false,
              "condition": null,
              "wearAndTearAnalysis": null,
              "lusterAndSurfaceQuality": null,
              "dateAcquired": null,
              "purchasePrice": null,
              "notes": null,
              "_user": "6777d9660b553d904df103fb",
              "userId": "6777d9660b553d904df103fb",
              "createdAt": "2025-02-24T10:49:33.702Z",
              "updatedAt": "2025-02-24T10:49:33.702Z"
          }
      }
    ```
  - `400 Bad Request`: Invalid update fields.
    ```json
    {
      "error": true,
      "reason": "Invalid update fields: invalidField"
    }
    ```
  - `500 Internal Server Error`: Error updating coin.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

#### `DELETE /coin/delete/:id`

- **Description**: Delete a particular coin from the private collection.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Coin ID
- **Response Example**:
  - `200 OK`: Coin deleted successfully.
    ```json
    {
      "error": false
    }
    ```
  - `400 Bad Request`: Coin not found.
    ```json
    {
      "error": true,
      "reason": "Incorrect Coin ID"
    }
    ```
  - `500 Internal Server Error`: Error deleting coin.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

#### `GET /coin/stats`

- **Description**: Get counts of coins in the private collection.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
- **Response Example**:
  - `200 OK`: Returns the total number of coins.
    ```json
    {
      "error": false,
      "data": {
        "totalCoinsInCollection": 100,
        "ownedCoins": 23,
        "identifiedCoins": 45,
        "wishlistedCoins": 3
      }
    }
    ```
  - `500 Internal Server Error`: Error fetching coin stats.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

### Custom collections

#### `POST /collections/add`

- **Description**: Create a named private (custom) collection for the signed-in user.
- **Request**:
  - **Headers**: `Authorization`: Bearer token
  - **Body**:
    ```json
    { "name": "Private collection #1" }
    ```
- **Response** (`200 OK`):
  ```json
  {
    "error": false,
    "data": {
      "collectionId": "6ac7560979755889ca446bc3",
      "name": "Private collection #1",
      "description": "",
      "imageUrl": null,
      "coinCount": 0,
      "createdAt": "2026-10-08T08:36:25.671Z",
      "updatedAt": "2026-10-08T08:36:25.671Z"
    }
  }
  ```

Web proxy: `POST /api/collections/add` (session cookie).

#### `GET /collections/fetchAll`

- **Description**: List custom collections plus aggregate counts (`ownedCount`, `identifiedCount`, `wishlistedCount`). Supports `pageNo` and `pageSize` query params.
- **Request**: `Authorization`: Bearer token
- **Response** (`200 OK`): `{ "error": false, "data": [ … ], "ownedCount": n, "identifiedCount": n, "wishlistedCount": n }`

Web proxy: `GET /api/collections/fetchAll`.

### Feedback Management

#### `PUT /feedback/:coinId`

- **Description**: Adds or updates feedback for a specific coin.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `coinId`: Coin ID
  - **Body**: JSON object with feedback details.

    | Field Name | Description        | Type    | Required | Notes               |
    |------------|--------------------|---------|----------|---------------------|
    | rating     | Rating of the coin | Number  | Yes      | Range: 0-5          |
    | comment    | Feedback comment   | String  | Yes       |                     |
- **Response Examples**:
  - `200 OK`: Feedback added or updated successfully.
    ```json
    {
      "error": false,
      "feedbackId": "feedback_id"
    }
    ```
  - `400 Bad Request`: Missing required fields or invalid data.
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```
  - `500 Internal Server Error`: An error occurred while processing the request.
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

#### `GET /feedback/:coinId`

- **Description**: Retrieves feedback for a specific coin.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `coinId`: Coin ID
- **Response Examples**:
  - `200 OK`: Feedback retrieved successfully.
    ```json
    {
      "error": false,
      "data": {
        "feedbackId": "feedback_id",
        "rating": 4,
        "comment": "Great coin!",
        "userId": "user_id",
        "coinId": "coin_id",
        "feedbackAt": "timestamp"
      }
    }
    ```
  - `200 OK`: No feedback found for the coin.
    ```json
    {
      "error": false,
      "data": null
    }
    ```
  - `500 Internal Server Error`: An error occurred while processing the request.
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

### Global Catalog (Archetypes)

#### `GET /archetypes/filteritems`

- **Description**: Get possible values of archetype properties for filtering.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Query Parameters**: Valid archetype property fields.
    | Field Name      | Description                      | Type    |
    |-----------------|----------------------------------|---------|
    | issuer          | Issuer of the archetype          | String  |
    | ruler           | Ruler during the archetype's minting | String  |
    | yearOfMinting   | Year the archetype was minted    | String  |
    | currency        | Currency of the archetype        | String  |
    | shape           | Shape of the archetype           | String  |
    | rarity          | Rarity of the archetype          | String  |
    | material        | Material of the archetype        | String  |
    | edgeType        | Edge type of the archetype       | String  |
    | technique       | Technique used to mint the archetype | String  |
    | mintLocation    | Location where the archetype was minted | String |

    > **NOTE:** At least one valid field (as listed above, case sensitive) needs to be provided as query param.

- **Response Examples**:
  - `200 OK`: Returns distinct values for the specified fields.
    ```json
    {
      "error": false,
      "data": {
        "issuer": ["Roman Empire"],
        "ruler": ["Julius Caesar"],
        "yearOfMinting": ["44 BC"],
        "technique": ["Struck"]
      }
    }
    ```

    __NOTE:__ The response data can be considerably large in size.
  - `400 Bad Request`: No valid fields provided.
    ```json
    {
      "error": true,
      "reason": "No valid fields provided"
    }
    ```
  - `500 Internal Server Error`: Error fetching distinct values.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

---

#### `POST /archetypes/fetchAll`

- **Description**: Fetch all archetypes in the global catalog with filters and pagination.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Query Parameters**:
    - `pageNo`: Page number (default: 0)
    - `pageSize`: Page size (default: 20)
    - `search`: Search term (optional)

    > **NOTE:** Specifying the `search` term in URL as query param performs a case insensitive text based search on the `name` field of the coins & filters the results accordingly.
  - **Body Example**: JSON object with filter fields.
    ```json
    {
      "issuer": ["Slovakia", "Qatar and Dubai"]
    }
    ```
    > **NOTE:** You can specify any of the field names listed below as keys here. The values specified for those key fields must always be an ARRAY which ideally contains the terms received for the respective keys from the `GET /coin/filteritems` endpoint. The results will get filtered accordingly.
    >
    > | Field Name      | Description                         | Type    |
    > |-----------------|-------------------------------------|---------|
    > | issuer          | Issuer of the coin                  | String[]  |
    > | ruler           | Ruler during the coin's minting     | String[]  |
    > | yearOfMinting   | Year the coin was minted            | String[]  |
    > | currency        | Currency of the coin                | String[]  |
    > | shape           | Shape of the coin                   | String[]  |
    > | rarity          | Rarity of the coin                  | String[]  |
    > | material        | Material of the coin                | String[]  |
    > | edgeType        | Edge type of the coin               | String[]  |
    > | technique       | Technique used to mint the coin     | String[]  |
    > | mintLocation    | Location where the coin was minted  | String[]  |
    > | inCirculation   | Whether the coin is in circulation  | Boolean[] |

- **Response Examples**:
  - `200 OK`: Returns the list of archetypes with pagination info.
    ```json
    {
      "error": false,
      "data": [
        {
          "archetypeId": "67e55954c3e20606478820d5",
          "name": "500 Korún",
          "issuer": "Slovakia",
          "isOwned": false,
          "isIdentified": false,
          "isWishlisted": false,
          "imageUrls": [
            "https://en.numista.com/catalogue/photos/slovaquie/64ac6c616ab4e3.41977012-180.jpg",
            "https://en.numista.com/catalogue/photos/slovaquie/64ac6c61c34d85.04106542-180.jpg"
          ],
          "marketplace": {
            "buy": {
              "isAvailable": false,
              "listingCount": 0
            },
            "sale": {
              "isAvailable": false,
              "listingId": null
            }
          }
        }
      ],
      "pagination": {
        "pageNo": 0,
        "pageSize": 1,
        "totalCount": 9
      }
    }
    ```
  - `400 Bad Request`: Invalid filter fields.
    ```json
    {
      "error": true,
      "reason": "Invalid query filter fields: invalidField"
    }
    ```
  - `500 Internal Server Error`: Error fetching archetypes.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

---

#### `GET /archetypes/getDetails/:id`

- **Description**: Get details of a particular archetype in the global catalog.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Archetype ID
- **Response Examples**:
  - `200 OK`: Returns the archetype details.
    ```json
    {
        "error": false,
        "data": {
            "_id": "67e55615c3e206064786ffa0",
            "name": "10 Korún",
            "rulerType": "Ruling authority",
            "ruler": "Republic (1993-date)",
            "backDesign": "Bronze cross (11th century A.D.) R stands for Replica",
            "coinType": "Non-circulating",
            "context": "Commemorative Slovakian coins are still redeemable by the National Bank of Slovakia at a rate of SKK 30.1260 = €1.",
            "currency": "Koruna (1993-2008)",
            "diameterMm": "26.5",
            "edgeType": null,
            "estimatedPrice": {},
            "frontDesign": "Slovak shield, year of mintage",
            "inCirculation": false,
            "inscriptions": "Obverse: SLOVENSKÁ REPUBLIKA 2003 Z Reverse: 10 Sk R Z",
            "isDemonetized": true,
            "issuer": "Slovakia",
            "material": "Gold (.999)",
            "mintLocation": null,
            "mintMark": null,
            "orientation": null,
            "rarity": "ULTRA_RARE",
            "shape": "Round",
            "technique": "Milled",
            "thicknessMm": null,
            "value": "10 Korún (10\u00a0SKK)",
            "weightGrams": "15.5517",
            "yearOfMinting": "2008",
            "imageUrls": [
                "https://en.numista.com/catalogue/photos/slovaquie/817-180.jpg",
                "https://en.numista.com/catalogue/photos/slovaquie/818-180.jpg"
            ],
            "coinSummary": "This is a 10 Korún Non-circulating coin. It has a denomination value of 10 Korún (10\u00a0SKK), the currency being Koruna (1993-2008). It was minted in 2008, issued by Slovakia, under the rule of Republic (1993-date). It is made of Gold (.999) and is Round in shape. The obverse design features: Slovak shield, year of mintage. The reverse design features: Bronze cross (11th century A.D.) R stands for Replica.",
            "isOwned": true,
            "isIdentified": false,
            "isWishlisted": false,
            "marketplace": {
              "buy": {
                "isAvailable": false,
                "listingCount": 0
              },
              "sale": {
                "isAvailable": false,
                "listingId": null
              }
            }
        }
    }
    ```
  - `400 Bad Request`: Invalid archetype ID.
    ```json
    {
      "error": true,
      "reason": "Incorrect Archetype ID"
    }
    ```
  - `500 Internal Server Error`: Error fetching archetype details.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

---

#### `GET /archetypes/coins-of-the-day`

- **Description**: Fetch three random archetypes with rarity `ULTRA_RARE` ("coins of the day"). Results are cached per calendar day. Includes personalized user collection flags and marketplace data.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
- **Response Examples**:
  - `200 OK`:
    ```json
    {
      "error": false,
      "data": [
        {
          "_id": "67e55615c3e206064786ffa0",
          "archetypeId": "67e55615c3e206064786ffa0",
          "name": "10 Korún",
          "rulerType": "Ruling authority",
          "ruler": "Republic (1993-date)",
          "backDesign": "Bronze cross (11th century A.D.) R stands for Replica",
          "coinType": "Non-circulating",
          "context": "Commemorative Slovakian coins are still redeemable...",
          "currency": "Koruna (1993-2008)",
          "diameterMm": "26.5",
          "edgeType": null,
          "estimatedPrice": {"UNC": "290.00-290.00"},
          "frontDesign": "Slovak shield, year of mintage",
          "inCirculation": false,
          "inscriptions": "Obverse: SLOVENSKÁ REPUBLIKA 2003 Z",
          "isDemonetized": true,
          "issuer": "Slovakia",
          "material": "Gold (.999)",
          "mintLocation": null,
          "mintMark": null,
          "orientation": null,
          "rarity": "ULTRA_RARE",
          "shape": "Round",
          "technique": "Milled",
          "thicknessMm": null,
          "value": "10 Korún (10 SKK)",
          "weightGrams": "15.5517",
          "yearOfMinting": "2008",
          "imageUrls": [
            "https://example.com/images/123_A.jpg",
            "https://example.com/images/123_B.jpg"
          ],
          "isOwned": false,
          "isIdentified": true,
          "isWishlisted": false,
          "marketplace": {
            "buy": {
              "isAvailable": true,
              "listingCount": 3
            },
            "sale": {
              "isAvailable": false,
              "listingId": null
            }
          }
        },
        // ...2 more objects
      ]
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

---

#### `PUT /archetypes/wishlist/add/:id`

- **Description**: Add an archetype to the wishlist (in the current user's private collection).
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Archetype ID
- **Response Examples**:
  - `200 OK`: Archetype added to the wishlist successfully.
    ```json
    {
        "error": false,
        "data": {
            "isIdentified": false,
            "isOwned": false,
            "isWishlisted": true,
            "isUserUpdated": false,
            "imageUrls": [
                "https://en.numista.com/catalogue/photos/slovaquie/64676fe8514fa0.56531592-180.jpg",
                "https://en.numista.com/catalogue/photos/slovaquie/64676fe8b63773.94661621-180.jpg"
            ],
            "name": "500 Korún",
            "currency": "Koruna (1993-2008)",
            "issuer": "Slovakia",
            "yearOfMinting": "2006",
            "ruler": "Republic (1993-date)",
            "shape": "Round",
            "rarity": "ULTRA_RARE",
            "weightGrams": "33.63",
            "diameterMm": "40",
            "thicknessMm": null,
            "material": "Silver (.925)",
            "edgeType": "Plain with lettering",
            "technique": "Milled",
            "mintMark": null,
            "frontDesign": "",
            "backDesign": "",
            "inscriptions": "Obverse: SLOVENSKÁ REPUBLIKA 2006 Reverse: NÁRODNÝ PARK MURÁNSKA PLANINA 500 Sk",
            "strikesAndDents": "",
            "context": "Commemorative Slovakian coins are still redeemable by the National Bank of Slovakia at a rate of SKK 30.1260 = €1.",
            "mintLocation": "(MK) Kremnica , Slovakia (1328-date)",
            "inCirculation": false,
            "condition": null,
            "wearAndTearAnalysis": "",
            "lusterAndSurfaceQuality": "",
            "dateAcquired": null,
            "purchasePrice": null,
            "notes": "",
            "estimatedPrice": {
                "UNC": "290.00-290.00"
            },
            "archetypeId": "67e55862c3e206064787d49d",
            "_user": "67da65db8fd1ce64cdbb675b",
            "userId": "67da65db8fd1ce64cdbb675b",
            "_id": "67ebb0b18fa3718f4f6dc605",
            "createdAt": "2025-04-01T09:24:01.050Z",
            "updatedAt": "2025-04-01T09:24:01.050Z",
            "__v": 0,
            "id": "67ebb0b18fa3718f4f6dc605",
            "coinId": "67ebb0b18fa3718f4f6dc605"
        }
    }
    ```
  - `400 Bad Request`: Archetype already wishlisted or owned.
    ```json
    {
      "error": true,
      "reason": "You've already wishlisted this archetype"
    }
    ```
  - `500 Internal Server Error`: Error adding archetype to wishlist.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

---

#### `DELETE /archetypes/wishlist/remove/:id`

- **Description**: Remove an archetype from the wishlist of current user. 

  Note that this endpoint is idempotent, so it will return no error even if no such wishlisted item exist in the current user's private collection.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Archetype ID
- **Response Examples**:
  - `200 OK`: Archetype removed from the wishlist successfully.
    ```json
    {
      "error": false
    }
    ```
  - `500 Internal Server Error`: Error removing archetype from wishlist.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

---

#### `GET /archetypes/stats`

- **Description**: Get the total number of archetypes in the global catalog.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
- **Response Examples**:
  - `200 OK`: Returns the total number of archetypes.
    ```json
    {
      "error": false,
      "data": {
        "totalArchetypes": 100
      }
    }
    ```
  - `500 Internal Server Error`: Error fetching archetype stats.
    ```json
    {
      "error": true,
      "reason": "Internal Server Error"
    }
    ```

---

## Marketplace

### Overview

The Marketplace API allows users to list coins for sale, browse and filter listings, and manage their own listings. All endpoints require JWT authentication.

---

### Marketplace Endpoints

#### `GET /marketplace/listing/filterItems`

- **Description**: Get possible values of marketplace listing properties for filtering.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Query Parameters**: Any combination of the following fields (case sensitive):

    | Field Name         | Description                        | Type   |
    |--------------------|------------------------------------|--------|
    | issuer             | Issuer of the coin                 | String |
    | ruler              | Ruler during the coin's minting    | String |
    | rarity             | Rarity of the coin                 | String |
    | material           | Material of the coin               | String |
    | shape              | Shape of the coin                  | String |
    | yearOfMinting      | Year the coin was minted           | String |
    | currency           | Currency of the coin               | String |
    | edgeType           | Edge type of the coin              | String |
    | technique          | Technique used to mint the coin    | String |
    | mintLocation       | Location where coin was minted     | String |
    | gradingScale       | Grading scale (e.g. Sheldon, PCGS) | String |
    | gradeValue         | Grade value (e.g. MS-70, VF-30)    | String |
    | gradingAuthority   | Grading authority (e.g. PCGS)      | String |
    | strikerType        | Striker type                       | String |
    | cleaningAlterations| Cleaning/alterations (multi-select)| String |
    | sellerLocation     | Seller's location                  | String |

    > **NOTE:** At least one valid field must be provided as a query param, e.g. `/marketplace/listing/filterItems?issuer&material&gradingScale&sellerLocation`
    >
    > **NOTE:** Always use `sellerLocation` as the field name (not `sellerDetails.location`).

- **Response Examples**:
  - `200 OK`:
    ```json
    {
      "error": false,
      "data": {
        "issuer": ["Roman Empire", "Australia"],
        "ruler": ["Augustus", "George V"],
        "material": ["Gold", "Silver", "Bronze"],
        "rarity": ["COMMON", "RARE"],
        "shape": ["Round", "Octagonal"],
        "yearOfMinting": ["1900", "1910", "1921"],
        "currency": ["USD", "EUR", "GBP"],
        "edgeType": ["Reeded", "Plain", "Lettered"],
        "technique": ["Milled", "Cast", "Hammered"],
        "mintLocation": ["London", "Paris", "Philadelphia"],
        "gradingScale": ["Sheldon", "PCGS"],
        "gradeValue": ["MS-70", "VF-30"],
        "gradingAuthority": ["PCGS", "NGC"],
        "strikerType": ["Hammered", "Machine"],
        "cleaningAlterations": ["Cleaned", "Polished"],
        "sellerLocation": ["New York", "London"]
      }
    }
    ```
  - `400 Bad Request`:
    ```json
    {
      "error": true,
      "reason": "No valid fields provided"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

---

#### `POST /marketplace/listing/fetchAll`

- **Description**: Fetch all marketplace listings with filters, pagination, and sorting.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Query Parameters**:

    | Param           | Description                                   | Type     | Default   |
    |-----------------|-----------------------------------------------|----------|-----------|
    | pageNo          | Page number                                   | Number   | 0         |
    | pageSize        | Page size                                     | Number   | 20        |
    | search          | Search term (text search on name/title)       | String   |           |
    | sortBy          | Sort order: `title`, `price_asc`, `price_desc`| String   | title     |
    | minPrice        | Minimum price                                 | Number   |           |
    | maxPrice        | Maximum price                                 | Number   |           |
    | archetypeId     | Filter by archetypeId                         | String   |           |
    | myListingsOnly  | Only show current user's listings             | Boolean  | false     |

  - **Body**: JSON object with filter fields (all values must be arrays):

    | Field Name         | Description                        | Type      |
    |--------------------|------------------------------------|-----------|
    | issuer             | Issuer of the coin                 | String[]  |
    | ruler              | Ruler during the coin's minting    | String[]  |
    | rarity             | Rarity of the coin                 | String[]  |
    | material           | Material of the coin               | String[]  |
    | shape              | Shape of the coin                  | String[]  |
    | yearOfMinting      | Year the coin was minted           | String[]  |
    | currency           | Currency of the coin               | String[]  |
    | edgeType           | Edge type of the coin              | String[]  |
    | technique          | Technique used to mint the coin    | String[]  |
    | mintLocation       | Location where coin was minted     | String[]  |
    | gradingScale       | Grading scale (e.g. Sheldon, PCGS) | String[]  |
    | gradeValue         | Grade value (e.g. MS-70, VF-30)    | String[]  |
    | gradingAuthority   | Grading authority (e.g. PCGS)      | String[]  |
    | strikerType        | Striker type                       | String[]  |
    | cleaningAlterations| Cleaning/alterations (multi-select)| String[]  |
    | sellerLocation     | Seller's location                  | String[]  |

    Example:
    ```json
    {
      "issuer": ["Australia"],
      "ruler": ["George V"],
      "rarity": ["COMMON", "RARE"],
      "material": ["Silver"],
      "edgeType": ["Reeded"],
      "technique": ["Milled"],
      "mintLocation": ["Melbourne"],
      "gradingScale": ["Sheldon"],
      "sellerLocation": ["London"]
    }
    ```

    > **NOTE:** Always use `sellerLocation` as the field name (not `sellerDetails.location`).

- **Response Examples**:
  - `200 OK`:
    ```json
    {
      "error": false,
      "data": [
        {
          "id": "6641a1f2b8e4a2a1b2c3d4e5",
          "_id": "6641a1f2b8e4a2a1b2c3d4e5",
          "title": "Ancient Roman Coin",
          "price": 100,
          "createdAt": "2025-04-01T10:00:00.000Z",
          "expiresAt": "2025-05-01T10:00:00.000Z",
          "isMyListing": false,
          "coinId": "6641a1f2b8e4a2a1b2c3d4e6",
          "archetypeId": "archetype_id",
          "sellerDetails": {
            "name": "John Doe",
            "contactEmail": "john@example.com",
            "externalLinks": ["https://ebay.com/johndoe"],
            "location": "London",
            "phoneNumber": "+44-1234567890",
            "bio": "Experienced coin seller."
          },
          "imageUrls": [
            "https://example.com/coin-front.jpg",
            "https://example.com/coin-back.jpg"
          ]
        },
        {
          "id": "6641a1f2b8e4a2a1b2c3d4e8",
          "_id": "6641a1f2b8e4a2a1b2c3d4e8",
          "title": "Australian Penny",
          "price": 50,
          "createdAt": "2025-04-02T11:00:00.000Z",
          "expiresAt": "2025-05-02T11:00:00.000Z",
          "isMyListing": true,
          "coinId": "6641a1f2b8e4a2a1b2c3d4e9",
          "archetypeId": "archetype_id_2",
          "sellerDetails": {
            "name": "Alice Smith",
            "contactEmail": "alice@example.com",
            "externalLinks": [],
            "location": "Sydney",
            "phoneNumber": "+61-987654321",
            "bio": "Collector and seller of Australian coins."
          },
          "imageUrls": [
            "https://example.com/coin-front2.jpg",
            "https://example.com/coin-back2.jpg"
          ]
        }
      ],
      "pagination": {
        "pageNo": 0,
        "pageSize": 20,
        "totalCount": 77,
        "sortBy": "title",
        "minPrice": 10,
        "maxPrice": 500,
        "archetypeId": "archetype_id",
        "myListingsOnly": false
      }
    }
    ```
  - `400 Bad Request`:
    ```json
    {
      "error": true,
      "reason": "Invalid query filter fields: invalidField"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

---

#### `GET /marketplace/listing/getDetails/:id`

- **Description**: Get details of a particular marketplace listing.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Listing ID
- **Response Examples**:
  - `200 OK`:
    ```json
    {
      "error": false,
      "data": {
        "_id": "6641a1f2b8e4a2a1b2c3d4e5",
        "id": "6641a1f2b8e4a2a1b2c3d4e5",
        "title": "Ancient Roman Coin",
        "price": 100,
        "issuer": "Roman Empire",
        "name": "Denarius",
        "rarity": "RARE",
        "gradingScale": "Sheldon",
        "gradeValue": "MS-70",
        "gradingAuthority": "PCGS",
        "certificationNumber": "PCGS123456",
        "strikerType": "Hammered",
        "cleaningAlterations": ["Cleaned"],
        "coinCondition": "Excellent",
        "createdAt": "2025-04-01T10:00:00.000Z",
        "expiresAt": "2025-05-01T10:00:00.000Z",
        "isMyListing": false,
        "coinId": "6641a1f2b8e4a2a1b2c3d4e6",
        "archetypeId": "6641a1f2b8e4a2a1b2c3d4e7",
        "coinDetails": {
          "name": "Denarius",
          "issuer": "Roman Empire",
          "ruler": "Augustus",
          "yearOfMinting": "1927",
          "currency": "Roman Denarius",
          "shape": "Round",
          "rarity": "RARE",
          "material": "Silver",
          "edgeType": "Plain",
          "technique": "Struck",
          "mintLocation": "Rome",
          "context": "Ancient Roman currency.",
          "inCirculation": false,
          "condition": "Excellent",
          "weightGrams": "3.9",
          "diameterMm": "18",
          "thicknessMm": "1.5",
          "mintMark": null,
          "frontDesign": "Head of Augustus",
          "backDesign": "Victory standing left",
          "inscriptions": "CAESAR AVGVSTVS",
          "strikesAndDents": "None",
          "wearAndTearAnalysis": "Minimal wear.",
          "lusterAndSurfaceQuality": "Bright",
          "isUserUpdated": false,
          "dateAcquired": null,
          "purchasePrice": null,
          "notes": "",
          "archetypeId": "6641a1f2b8e4a2a1b2c3d4e7",
          "imageUrls": [
            "https://example.com/coin-front.jpg",
            "https://example.com/coin-back.jpg"
          ]
        },
        "sellerDetails": {
          "name": "John Doe",
          "contactEmail": "john@example.com",
          "externalLinks": ["https://ebay.com/johndoe"],
          "location": "London",
          "phoneNumber": "+44-1234567890",
          "bio": "Experienced coin seller."
        },
        "imageUrls": [
          "https://example.com/coin-front.jpg",
          "https://example.com/coin-back.jpg"
        ]
      }
    }
    ```
  - `400 Bad Request`:
    ```json
    {
      "error": true,
      "reason": "Listing not found"
    }
    ```
  - `400 Bad Request` (expired):
    ```json
    {
      "error": true,
      "reason": "Listing has expired"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

---

#### `PATCH /marketplace/listing/update/:id`

- **Description**: Update a marketplace listing (only by the owner, and only if not expired).
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Listing ID
  - **Body**: JSON object with updatable fields:

    | Field Name            | Description                                             | Type             |
    |-----------------------|---------------------------------------------------------|------------------|
    | title                 | Listing title                                           | String           |
    | price                 | Listing price                                           | Number           |
    | gradingScale          | Grading scale (e.g., Sheldon, PCGS)                     | String           |
    | gradeValue            | Grade value (e.g., MS-70, VF-30)                        | String           |
    | gradingAuthority      | Grading authority (e.g., PCGS, NGC, ANACS)              | String           |
    | certificationNumber   | Certification or slab number                            | String           |
    | strikerType           | Type of striker used (e.g., Hammered)                   | String           |
    | cleaningAlterations   | Cleaning/alterations (multi-select)                     | Array of String  |
    | coinCondition         | Overall condition description                           | String           |
    | sellerDetails         | Nested seller details object (name, contactEmail, etc.) | Object           |

    Example:
    ```json
    {
      "title": "Updated Coin Title",
      "price": 120,
      "gradingScale": "Sheldon",
      "gradeValue": "MS-70",
      "gradingAuthority": "PCGS",
      "certificationNumber": "PCGS123456",
      "strikerType": "Hammered",
      "cleaningAlterations": ["Cleaned"],
      "coinCondition": "Excellent",
      "sellerDetails": {
        "name": "John Doe",
        "contactEmail": "john@example.com",
        "externalLinks": ["https://example.com/listing"],
        "location": "New York, USA",
        "phoneNumber": "+1234567890",
        "bio": "Experienced coin seller."
      }
    }
    ```

- **Response Examples**:
  - `200 OK`:
    ```json
    {
      "error": false,
      "data": {
        "_id": "6641a1f2b8e4a2a1b2c3d4e5",
        "title": "Updated Coin Title",
        "price": 120,
        "gradingScale": "Sheldon",
        "gradeValue": "MS-70",
        "gradingAuthority": "PCGS",
        "certificationNumber": "PCGS123456",
        "strikerType": "Hammered",
        "cleaningAlterations": ["Cleaned"],
        "coinCondition": "Excellent",
        "createdAt": "2025-04-01T10:00:00.000Z",
        "expiresAt": "2025-05-01T10:00:00.000Z",
        "isMyListing": false,
        "coinId": "6641a1f2b8e4a2a1b2c3d4e6",
        "archetypeId": "6641a1f2b8e4a2a1b2c3d4e7",
        "coinDetails": {
          "name": "Denarius",
          "issuer": "Roman Empire",
          "ruler": "Augustus",
          "yearOfMinting": "1927",
          "currency": "Roman Denarius",
          "shape": "Round",
          "rarity": "RARE",
          "material": "Silver",
          "edgeType": "Plain",
          "technique": "Struck",
          "mintLocation": "Rome",
          "context": "Ancient Roman currency.",
          "inCirculation": false,
          "condition": "Excellent",
          "weightGrams": "3.9",
          "diameterMm": "18",
          "thicknessMm": "1.5",
          "mintMark": null,
          "frontDesign": "Head of Augustus",
          "backDesign": "Victory standing left",
          "inscriptions": "CAESAR AVGVSTVS",
          "strikesAndDents": "None",
          "wearAndTearAnalysis": "Minimal wear.",
          "lusterAndSurfaceQuality": "Bright",
          "isUserUpdated": false,
          "dateAcquired": null,
          "purchasePrice": null,
          "notes": "",
          "archetypeId": "6641a1f2b8e4a2a1b2c3d4e7",
          "imageUrls": [
            "https://example.com/coin-front.jpg",
            "https://example.com/coin-back.jpg"
          ]
        },
        "sellerDetails": {
          "name": "John Doe",
          "contactEmail": "john@example.com",
          "externalLinks": ["https://ebay.com/johndoe"],
          "location": "London",
          "phoneNumber": "+44-1234567890",
          "bio": "Experienced coin seller."
        },
        "imageUrls": [
          "https://example.com/coin-front.jpg",
          "https://example.com/coin-back.jpg"
        ]
      }
    }
    ```
  - `400 Bad Request` (not found or not owner):
    ```json
    {
      "error": true,
      "reason": "Listing not found or you don't have permission to update it"
    }
    ```
  - `400 Bad Request` (expired):
    ```json
    {
      "error": true,
      "reason": "Cannot update expired listing"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

---

#### `DELETE /marketplace/listing/delete/:id`

- **Description**: Delete a marketplace listing (only by the owner).
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Listing ID
- **Response Examples**:
  - `200 OK`:
    ```json
    {
      "error": false
    }
    ```
  - `400 Bad Request`:
    ```json
    {
      "error": true,
      "reason": "Listing not found or you don't have permission to delete it"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

---

#### `PATCH /marketplace/markSold/:id`

- **Description**: Mark a marketplace listing as sold (owner only). Sets `isSold` and `isArchived` to `true`. Same contract as [antiques-api docs](https://antiques-api.trackzio.com/docs#/core-module?id=patch-marketplacemarksoldid); Coinzy web proxies via `PATCH /api/marketplace/markSold/[id]` on the **catalogue/auth** session host.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:
    - `id`: Listing ID
  - **Body** (all optional):

    | Field         | Type   | Description              |
    |---------------|--------|--------------------------|
    | `soldDate`    | Date   | When the item was sold   |
    | `soldCurrency`| String | Sale currency            |
    | `soldPrice`   | Number | Final selling price      |

- **Notes**: Already-sold or expired listings cannot be updated. Web UI currently posts `{}` (no sold-price form yet).

---

#### Seller profile (auth host)

Seller contact fields used by sell/list live on the **auth/catalogue** host as `user.sellerDetails` via `GET` / `PATCH auth/me` (see `docs/auth-api.md` · Update seller profile). Web: `GET|PATCH /api/auth/me`. Gate sell/list with `useSellerProfileGate` when name/contactEmail are missing. Do not confuse with marketplace-host listing routes below.

#### `POST /marketplace/sell/private/:id`

- **Description**: Create a marketplace listing from a coin in the user's private collection.
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:

    | Param | Description                        | Type   |
    |-------|------------------------------------|--------|
    | id    | Coin ID from private collection    | String |

  - **Body**: JSON object with required listing fields:

    | Field Name     | Description           | Type    | Required |
    |----------------|-----------------------|---------|----------|
    | price          | Listing price         | Number  | Yes      |
    | title          | Listing title         | String  | No (defaults to coin name) |
    | gradingScale   | Grading scale         | String  | No       |
    | gradeValue     | Grade value           | String  | No       |
    | gradingAuthority| Grading authority    | String  | No       |
    | certificationNumber| Certification #    | String  | No       |
    | strikerType    | Striker type          | String  | No       |
    | cleaningAlterations| Cleaning/alterations| Array of String | No |
    | coinCondition  | Coin condition        | String  | No       |
    | sellerDetails  | Seller details        | Object  | Yes      |

    `sellerDetails` object must include:
    | Field Name     | Description           | Type    | Required |
    |----------------|-----------------------|---------|----------|
    | name           | Seller name           | String  | Yes      |
    | contactEmail   | Contact email         | String  | Yes      |
    | location       | Seller location       | String  | Yes      |
    | externalLinks  | External links        | Array of String | No |
    | phoneNumber    | Phone number          | String  | No       |
    | bio            | Seller bio            | String  | No       |

    Example:
    ```json
    {
      "title": "Rare Roman Coin",
      "price": 250,
      "gradingScale": "Sheldon",
      "gradeValue": "MS-70",
      "sellerDetails": {
        "name": "John Doe",
        "contactEmail": "seller@example.com",
        "location": "London",
        "externalLinks": ["https://ebay.com/johndoe"],
        "phoneNumber": "+44-1234567890",
        "bio": "Experienced coin seller."
      }
    }
    ```

- **Response Examples**:
  - `200 OK`:
    ```json
    {
      "error": false,
      "data": {
        "_specimen": "67bf3868de12565fad7e9142",
        "_user": "6777d9660b553d904df103fb",
        "coinId": "67bf3868de12565fad7e9142",
        "userId": "6777d9660b553d904df103fb",
        "expiresAt": "2025-06-08T07:20:09.577Z",
        "title": "One Half Penny",
        "price": 250,
        "cleaningAlterations": [],
        "coinDetails": {
          "name": "One Half Penny",
          "issuer": "Commonwealth of Australia",
          "ruler": "George V - United Kingdom",
          "yearOfMinting": "1916",
          "currency": "Penny",
          "shape": "Round",
          "rarity": "COMMON",
          "material": "Bronze",
          "edgeType": "Plain",
          "technique": "Struck",
          "mintLocation": null,
          "context": "British Commonwealth",
          "inCirculation": false,
          "condition": null,
          "weightGrams": null,
          "diameterMm": null,
          "thicknessMm": null,
          "mintMark": null,
          "frontDesign": "Head of King George V",
          "backDesign": "Commonwealth of Australia, One Half Penny, 1916",
          "inscriptions": "GEORGE V KING EMPEROR, COMMONWEALTH OF AUSTRALIA, ONE HALF PENNY, 1916",
          "strikesAndDents": null,
          "wearAndTearAnalysis": null,
          "lusterAndSurfaceQuality": null,
          "archetypeId": null,
          "imageUrls": []
        },
        "sellerDetails": {
          "name": "John Doe",
          "contactEmail": "john@doe.com",
          "externalLinks": [],
          "location": "London"
        },
        "_id": "681daca9328fa731d3454be6",
        "createdAt": "2025-05-09T07:20:09.595Z",
        "updatedAt": "2025-05-09T07:20:09.595Z",
        "__v": 0,
        "isActive": true,
        "id": "681daca9328fa731d3454be6"
      }
    }
    ```
  - `400 Bad Request` (already listed):
    ```json
    {
      "error": true,
      "reason": "You have already listed this coin in the marketplace"
    }
    ```
  - `404 Not Found` (not owned):
    ```json
    {
      "error": true,
      "reason": "Coin not found or you don't own this coin"
    }
    ```
  - `400 Bad Request` (missing fields):
    ```json
    {
      "error": true,
      "reason": "Title, price, and sellerDetails are required fields"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

---

#### `POST /marketplace/sell/global/:id`

- **Description**: Create a marketplace listing from a coin of a given archetype in the global catalog (must be owned by the user).
- **Request**:
  - **Headers**:
    - `Authorization`: Bearer token
  - **Path Parameters**:

    | Param | Description                        | Type   |
    |-------|------------------------------------|--------|
    | id    | Archetype ID from global catalog   | String |

  - **Body**: JSON object with required listing fields (same as above):

    | Field Name     | Description           | Type    | Required |
    |----------------|-----------------------|---------|----------|
    | price          | Listing price         | Number  | Yes      |
    | title          | Listing title         | String  | No (defaults to coin name) |
    | gradingScale   | Grading scale         | String  | No       |
    | gradeValue     | Grade value           | String  | No       |
    | gradingAuthority| Grading authority    | String  | No       |
    | certificationNumber| Certification #    | String  | No       |
    | strikerType    | Striker type          | String  | No       |
    | cleaningAlterations| Cleaning/alterations| Array of String | No |
    | coinCondition  | Coin condition        | String  | No       |
    | sellerDetails  | Seller details        | Object  | Yes      |

    `sellerDetails` object must include:
    | Field Name     | Description           | Type    | Required |
    |----------------|-----------------------|---------|----------|
    | name           | Seller name           | String  | Yes      |
    | contactEmail   | Contact email         | String  | Yes      |
    | location       | Seller location       | String  | Yes      |
    | externalLinks  | External links        | Array of String | No |
    | phoneNumber    | Phone number          | String  | No       |
    | bio            | Seller bio            | String  | No       |

    Example:
    ```json
    {
      "title": "Rare Roman Coin",
      "price": 250,
      "gradingScale": "Sheldon",
      "gradeValue": "MS-70",
      "sellerDetails": {
        "name": "John Doe",
        "contactEmail": "seller@example.com",
        "location": "London",
        "externalLinks": ["https://ebay.com/johndoe"],
        "phoneNumber": "+44-1234567890",
        "bio": "Experienced coin seller."
      }
    }
    ```

- **Response Examples**:
  - `200 OK`:
    ```json
    {
      "error": false,
      "data": {
        "_specimen": "67bf3868de12565fad7e9142",
        "_user": "6777d9660b553d904df103fb",
        "coinId": "67bf3868de12565fad7e9142",
        "userId": "6777d9660b553d904df103fb",
        "expiresAt": "2025-06-08T07:20:09.577Z",
        "title": "One Half Penny",
        "price": 250,
        "cleaningAlterations": [],
        "coinDetails": {
          "name": "One Half Penny",
          "issuer": "Commonwealth of Australia",
          "ruler": "George V - United Kingdom",
          "yearOfMinting": "1916",
          "currency": "Penny",
          "shape": "Round",
          "rarity": "COMMON",
          "material": "Bronze",
          "edgeType": "Plain",
          "technique": "Struck",
          "mintLocation": null,
          "context": "British Commonwealth",
          "inCirculation": false,
          "condition": null,
          "weightGrams": null,
          "diameterMm": null,
          "thicknessMm": null,
          "mintMark": null,
          "frontDesign": "Head of King George V",
          "backDesign": "Commonwealth of Australia, One Half Penny, 1916",
          "inscriptions": "GEORGE V KING EMPEROR, COMMONWEALTH OF AUSTRALIA, ONE HALF PENNY, 1916",
          "strikesAndDents": null,
          "wearAndTearAnalysis": null,
          "lusterAndSurfaceQuality": null,
          "archetypeId": null,
          "imageUrls": []
        },
        "sellerDetails": {
          "name": "John Doe",
          "contactEmail": "john@doe.com",
          "externalLinks": [],
          "location": "London"
        },
        "_id": "681daca9328fa731d3454be6",
        "createdAt": "2025-05-09T07:20:09.595Z",
        "updatedAt": "2025-05-09T07:20:09.595Z",
        "__v": 0,
        "isActive": true,
        "id": "681daca9328fa731d3454be6"
      }
    }
    ```
  - `400 Bad Request` (already listed):
    ```json
    {
      "error": true,
      "reason": "You have already listed a coin of this archetype in the marketplace"
    }
    ```
  - `404 Not Found` (not owned):
    ```json
    {
      "error": true,
      "reason": "You don't own any coins of this archetype"
    }
    ```
  - `400 Bad Request` (missing fields):
    ```json
    {
      "error": true,
      "reason": "Title, price, and sellerDetails are required fields"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "error": true,
      "reason": "Error message"
    }
    ```

---
