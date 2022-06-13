# wikipedia
Connector between Wikipedia and Mediakunst.net

version 1.x

The connector does an import of the wikepedia article based upon the Q-id of the artist. The is looked up in 
the WikiData. It than uses the result page to find an english article, which is assumed to be the biography 
of the artist. The resulting page is retrieved and scanned so only partial information is loaded:

- only none full summery paragraphs are imported
- section, paragraph and sentences are maintained
- bold and italic are preserved and converted to classes
- headings are reduced to one level
- links (internal and external) are removed
- images and other media are removed
- pronunciation links are removed

Test results as HTML files are generated in the data directory by the **./dump.js** script. The template 
is defined in the **/templates/preview.html** template.

Resulting JSON document:

```json
{
  "wikiUrl" : "https://en.wikipedia.org/wiki/Marina_Abramovi%C4%87",
  "artistName" : "Marina Abramovic",
  "bio" : [
    {
      "paragraphs" : [
        {
          "sentences" : [
            {
              "text" : "Marina Abramović (born November 30, 1946) is a Serbian conceptual and performance artist, philanthropist, writer, and filmmaker.",
              "format" : {
                "bold" : [
                  "Marina Abramović"
                ]
              }
            },
            {
              "text" : "Her work explores body art, endurance art and feminist art, the relationship between the performer and audience, the limits of the body, and the possibilities of the mind."
            },
            {
              "text" : "Being active for over four decades, Abramović refers to herself as the \"grandmother of performance art\"."
            },
            {
              "text" : "She pioneered a new notion of identity by bringing in the participation of observers, focusing on \"confronting pain, blood, and physical limits of the body\"."
            },
            {
              "text" : "In 2007, she founded the Marina Abramović Institute (MAI), a non-profit foundation for performance art."
            }
          ]
        }
      ]
    },
    {
      "title" : "Works with Ulay (Uwe Laysiepen)",
      "paragraphs" : [
        {
          "sentences" : [
            {
              "text" : "In 1976, after moving to Amsterdam, Abramović met the West German performance artist Uwe Laysiepen, who went by the single name Ulay."
            },
            {
              "text" : "They began living and performing together that year."
            },
            {
              "text" : "When Abramović and Ulay began their collaboration, the main concepts they explored were the ego and artistic identity."
            }            
          ]
        },
        {
          "sentences" : [
            {
              "text" : "The work of Abramović and Ulay tested the physical limits of the body and explored male and female principles, psychic energy, transcendental meditation and nonverbal communication."
            },
            {
              "text" : "While some critics have explored the idea of a hermaphroditic state of being as a feminist statement, Abramović herself denies considering this as a conscious concept."
            },           
            {
              "text" : "In discussing this phase of her performance history, she has said: \"The main problem in this relationship was what to do with the two artists' egos. I had to find out how to put my ego down, as did he, to create something like a hermaphroditic state of being that we called the death self.\""
            }
          ],
          "lists" : [
            {
              "items" : [
                {
                  "text" : "In Relation in Space (they ran into each other repeatedly for an hour – mixing male and female energy into the third component called \"that self\".",
                  "format" : {
                    "italic" : [
                      "Relation in Space"
                    ]
                  }
                },
                {
                  "text" : "Relation in Movement (had the pair driving their car inside of a museum for 365 laps; a black liquid oozed from the car, forming a kind of sculpture, each lap representing a year. (After 365 laps the idea was that they entered the New Millennium.)",
                  "format" : {
                    "italic" : [
                      "Relation in Movement"
                    ]
                  }
                },
                {
                  "text" : "In Relation in Time (they sat back to back, tied together by their ponytails for sixteen hours. They then allowed the public to enter the room to see if they could use the energy of the public to push their limits even further.",
                  "format" : {
                    "italic" : [
                      "Relation in Time"
                    ]
                  }
                }                
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Adjusting the template

The data can be retrieved by the **generate.one.js** script. This will create the **/temp/output.html** that can shown
with **/templates/index.surface.html**. The merge is done by merging the data (**/temp/output.json**) with the template
(**/templates/body.shtml**). The template should be place within the client workspace (mediakunst)

## Adjusting the stylesheet
TailwindCSS is used as stylesheet engine. The system needs to compile the source file into a super small stylesheet.
To auto compile the stylesheet use:
```shell
npm run tailwind:dev
```
The stylesheet is located at **/css/styles.css**. The generated style sheet is at **/css/wikibio.css**
The definition does **NOT** remove the default styles because that would interfere with the styles used by the
mediakunst.net siteT

To regenerate the data with the template use:
```shell
 node generate.one.js 
```
and refresh the **/templates/index.surface.html**. The adjust file is **/temp/output.html** and **/temp/output.json**

# BE CAREFULL 
## All tailwind tags should be preceded with "mk-" to stop the name collision
