import React from "react"

export default function GithubProjectForks({ count = 0 }) {
  return <div className="px-3 whitespace-nowrap">{count} forks</div>
}
