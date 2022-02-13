module Main exposing (main)

import Browser
import Html exposing (..)
import Http
import List
import String exposing (lines)



-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }



-- MODEL


type Dictionary
    = Dictionary DictionaryEntries


type DictionaryEntries
    = DictionaryEntries (List String)


type Model
    = Failure
    | Loading
    | Success Dictionary


init : () -> ( Model, Cmd Msg )
init _ =
    ( Loading, getInputData )



-- UPDATE


type Msg
    = GotInputData (Result Http.Error String)


isValidDictionaryEntry : String -> Bool
isValidDictionaryEntry entry =
    let
        words =
            String.trim entry |> String.words

        onlyOneWord =
            List.length words |> (==) 1

        wordWithinSizeRange =
            Maybe.withDefault False (List.head words |> Maybe.map (\word -> String.length word <= 12))
    in
    onlyOneWord && wordWithinSizeRange


dictionaryFromInputData : String -> Dictionary
dictionaryFromInputData inputData =
    let
        lines =
            String.lines inputData

        validEntries =
            List.filter isValidDictionaryEntry lines
    in
    validEntries |> DictionaryEntries |> Dictionary


exampleDictionary : Dictionary
exampleDictionary =
    [ "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune" ]
        |> DictionaryEntries
        |> Dictionary


update : Msg -> Model -> ( Model, Cmd Msg )
update msg _ =
    case msg of
        GotInputData contents ->
            case Result.map dictionaryFromInputData contents of
                Ok dictionary ->
                    ( Success dictionary, Cmd.none )

                Err _ ->
                    ( Failure, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



-- VIEW


view : Model -> Html Msg
view model =
    case model of
        Failure ->
            p []
                [ text "Could not load the input data for some reason. Is there an input.txt in the `src/` directory?"
                ]

        Loading ->
            p [] [ text "Loading input data..." ]

        Success dictionary ->
            ul []
                [ li []
                    [ charactersFromString "ajsxuytcnhre"
                        |> solve exampleDictionary
                        |> (++) "Challenge example output: "
                        |> text
                    ]
                , li []
                    [ charactersFromString "optonoceari"
                        |> solve dictionary
                        |> (++) "Challenge real output: "
                        |> text
                    ]
                ]


charactersFromString : String -> List Char
charactersFromString =
    String.toList


solve : Dictionary -> List Char -> String
solve dictionary usableCharacters =
    usableCharacters
        |> findLongestConstructableWord dictionary
        |> Maybe.withDefault "No match found"


unwrapDictionary : Dictionary -> DictionaryEntries
unwrapDictionary (Dictionary entries) =
    entries


unwrapDictionaryEntries : DictionaryEntries -> List String
unwrapDictionaryEntries (DictionaryEntries items) =
    items


removeItemAtIndex : Int -> List a -> List a
removeItemAtIndex index list =
    List.take index list ++ List.drop (index + 1) list


dropFirstOccurrenceOfCharacter : String -> Char -> String
dropFirstOccurrenceOfCharacter string character =
    case String.indexes (String.fromChar character) string of
        [] ->
            string

        index :: _ ->
            String.toList string
                |> removeItemAtIndex index
                |> String.fromList


isEntryConstructableFromCharacters : List Char -> String -> Bool
isEntryConstructableFromCharacters usableCharacters entry =
    case usableCharacters of
        [] ->
            String.length entry == 0

        character :: characters ->
            dropFirstOccurrenceOfCharacter entry character |> isEntryConstructableFromCharacters characters


longestWordsReducer : String -> Maybe String -> Maybe String
longestWordsReducer entry accumulator =
    case accumulator of
        Nothing ->
            Just entry

        Just longest ->
            if String.length entry > String.length longest then
                Just entry

            else
                Just longest


findLongestConstructableWord : Dictionary -> List Char -> Maybe String
findLongestConstructableWord dictionary usableCharacters =
    unwrapDictionary dictionary
        |> unwrapDictionaryEntries
        |> List.filter (isEntryConstructableFromCharacters usableCharacters)
        |> List.foldl longestWordsReducer Nothing



-- HTTP


getInputData : Cmd Msg
getInputData =
    Http.get
        { url = "/input.txt"
        , expect = Http.expectString GotInputData
        }
