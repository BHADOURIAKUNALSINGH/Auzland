from openai import OpenAI

openai = OpenAI(
    api_key="O8M7bYCy8ACaUZRYH3lGnTSIKoX92ZgI",
    base_url="https://api.deepinfra.com/v1/openai",
)

stream = True # or False

chat_completion = openai.chat.completions.create(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    messages=[{"role": "user", "content": "Hello"}],
    stream=stream,
)

if stream:
    for event in chat_completion:
        if event.choices[0].finish_reason:
            print(event.choices[0].finish_reason,
                  event.usage['prompt_tokens'],
                  event.usage['completion_tokens'])
        else:
            print(event.choices[0].delta.content)
else:
    print(chat_completion.choices[0].message.content)
    print(chat_completion.usage.prompt_tokens, chat_completion.usage.completion_tokens)
