#!/usr/bin/env bash

base=${1:-https://coinzyai.com}
base=${base%/}
ai_bots=(GPTBot OAI-SearchBot ChatGPT-User ClaudeBot Claude-SearchBot Claude-User Claude-Web anthropic-ai PerplexityBot Perplexity-User Google-Extended Applebot-Extended Bytespider CCBot Meta-ExternalAgent cohere-ai Amazonbot DuckAssistBot MistralAI-User)
search_bots=(Googlebot bingbot Applebot DuckDuckBot Mozilla/5.0)
paths=(/ /sitemap.xml /llms.txt /robots.txt)
failures=0

printf 'Checking %s (OK means the expected HTTP response was observed)\n\n' "$base"
for bot in "${ai_bots[@]}" "${search_bots[@]}"; do
  is_ai=false
  for ai_bot in "${ai_bots[@]}"; do
    if [[ $bot == "$ai_bot" ]]; then is_ai=true; break; fi
  done
  for path in "${paths[@]}"; do
    expected=2xx
    if [[ $is_ai == true && $path != /llms.txt ]]; then expected=403; fi
    status=$(curl -sS -L --max-time 15 -o /dev/null -w '%{http_code}' -A "$bot" "${base}${path}") || status=error
    result=FAIL
    if [[ $expected == 403 && $status == 403 ]] || [[ $expected == 2xx && $status == 2[0-9][0-9] ]]; then
      result=OK
    else
      ((failures+=1))
    fi
    printf '%-4s  %-20s %-14s %-5s expected %s\n' "$result" "$bot" "$path" "$status" "$expected"
  done
done
printf '\n%d check(s) failed.\n' "$failures"
((failures == 0))
