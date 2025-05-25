'''
Calls anthropic API and label some response
'''
import anthropic 
from dotenv import load_dotenv
import json 
load_dotenv()

client = anthropic.Anthropic()


def generate_response(query):
    '''
    Label inner thoughts
    '''
    message = client.messages.create(
       model="claude-3-7-sonnet-latest",
        max_tokens=1000,
        temperature=1,
        system="""You are a language model that reasons step-by-step.  
 After every thought, output a tag on its own line in the form  
 [LABEL] where LABEL ∈ {
WORKING_MEMORY, SEMANTIC_RETRIEVAL, LOGICAL_REASONING, PATTERN_RECOGNITION,
ANALOGICAL_REASONING, ERROR_MONITORING, PLANNING, EVALUATION,
CREATIVE_SYNTHESIS, ATTENTION_CONTROL, OTHER
}

                Guidelines:
                • A “thought” should be ≤ 30 words.
                • Emit exactly one tag per thought, on its own line.
                • Continue thinking until you have a final answer; then prefix the answer with FINAL:
                • Choose a label if possible; if really uncertain, output [OTHER]

                Example
                THOUGHT 1: Let me keep track of the assumptions we have so far...
                [WORKING_MEMORY]
                THOUGHT 2: If X is true, then Y must follow...
                [LOGICAL_REASONING]
                THOUGHT 3: This reminds me of the classic trolley problem...
                [ANALOGICAL_REASONING]
                FINAL: Therefore the best option is…
        """,
        messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": query
                }
            ]
        }
    ]
    )

    print(message.content)
    return message.content[0].text 

def format_response(text: str):
    message = client.messages.create(
       model="claude-3-7-sonnet-latest",
        max_tokens=1000,
        temperature=1,
        system="""You will be given a single string containing multiple “THOUGHT” entries, each of which looks like:

            THOUGHT <n>: <some text>
            [<LABEL>]

            Your task is to parse that string and return **only** a JSON array of two-element arrays, where each element is:

            1. The thought text (with no “THOUGHT n:” prefix and with all whitespace/newlines collapsed into single spaces)  
            2. The label (no brackets)

            For example, given:

            THOUGHT 1: The ocean is salty because water dissolves minerals from rocks and carries them to the sea.
            [SEMANTIC_RETRIEVAL]

            THOUGHT 2: Let me trace the water cycle: rain falls on land, flows through rivers, picks up dissolved salts.
            [LOGICAL_REASONING]

            You should output:

            [
                ["The ocean is salty because water dissolves minerals from rocks and carries them to the sea.", "SEMANTIC_RETRIEVAL"],
                ["Let me trace the water cycle: rain falls on land, flows through rivers, picks up dissolved salts.", "LOGICAL_REASONING"]
            ]

            **Do not** include any extra text, explanation, or formatting—just the JSON array.
        """,
        messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": text
                }
            ]
        }
    ]
    )

    # try converting to python object 
    try:
        thought_label_list = json.loads(message.text)
    except:
        raise Exception("Failed to convert to python list of thoughts and labels")

    return thought_label_list


if __name__ == "__main__":
    #generate_response("Why is the ocean salty? What are the physical and ecological reasons for this.")

    current_response = """THOUGHT 1: The ocean is salty because water dissolves minerals from rocks and carries them to the sea.\n[SEMANTIC_RETRIEVAL]\n\nTHOUGHT 2: Let me trace the water cycle: rain falls on land, flows through rivers, picks up dissolved salts.\n[LOGICAL_REASONING]\n\nTHOUGHT 3: Rivers continuously add salt to oceans, but water evaporates leaving salt behind, concentrating it over time.\n[PATTERN_RECOGNITION]\n\nTHOUGHT 4: I should consider the geological timescales - this process has been happening for billions of years.\n[WORKING_MEMORY]\n\nTHOUGHT 5: Underwater volcanic activity and hydrothermal vents also release minerals directly into seawater.\n[SEMANTIC_RETRIEVAL]\n\nTHOUGHT 6: The main salts are sodium chloride, but also magnesium, calcium, and potassium compounds.\n[SEMANTIC_RETRIEVAL]\n\nTHOUGHT 7: Now I need to consider the ecological reasons - how does salinity affect marine life?\n[PLANNING]\n\nTHOUGHT 8: Marine organisms evolved osmoregulation systems to maintain water balance in salty environments.\n[LOGICAL_REASONING]\n\nTHOUGHT 9: Salinity creates distinct ecological niches - different species thrive at different salt concentrations.\n[PATTERN_RECOGNITION]\n\nTHOUGHT 10: Ocean salinity affects water density, which drives important currents that distribute nutrients and heat.\n[LOGICAL_REASONING]\n\nTHOUGHT 11: Salt water has a lower freezing point, allowing liquid oceans in polar regions supporting unique ecosystems.\n[LOGICAL_REASONING]\n\nFINAL: The ocean is salty due to physical processes: rivers continuously deliver dissolved minerals from weathered rocks, while evaporation removes only pure water, concentrating salts over billions of years. Underwater volcanic activity adds more minerals. Ecologically, this salinity is crucial - it drives ocean currents that distribute nutrients globally, creates diverse habitats for specially-adapted marine life with osmoregulation systems, and maintains liquid water in cold regions, supporting polar ecosystems."""
    
    thoughts_labels = format_response(current_response)


    print("End script.")