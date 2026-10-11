#!/bin/bash
find /Users/macbookair/Desktop/Systech-Projects/BD-NID/WEB/src -type f -name "*.jsx" -print0 | xargs -0 sed -i '' 's/toast.error(result?.error?.data?.message ||/const errMsg = result?.error?.data?.message; toast.error(typeof errMsg === "string" ? errMsg : (Array.isArray(errMsg) ? (typeof errMsg[0] === "string" ? errMsg[0] : "Validation Error") : "An error occurred") ||/g'
