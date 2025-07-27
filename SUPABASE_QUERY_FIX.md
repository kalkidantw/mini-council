# Supabase Query Fix - Summary

## 🐛 Issue Fixed

**Problem**: PGRST116 error - "JSON object requested, multiple (or no) rows returned"

**Root Cause**: Using `.single()` on queries that might return multiple rows or no rows, causing Supabase to throw an error instead of returning an array.

## 🔧 Fixes Applied

### 1. **backend/routes/debate.js**
- ✅ Replaced `.single()` with `.limit(1)`
- ✅ Changed `dilemmaData` to `dilemmaDataArray` to handle array response
- ✅ Added `const dilemmaData = dilemmaDataArray?.[0];` to extract first item
- ✅ Maintained all existing logging and error handling

### 2. **backend/auth.js**
- ✅ Fixed login route `.single()` call
- ✅ Updated to use `.limit(1)` and handle array response
- ✅ Improved error handling for user not found cases

### 3. **routes/debate.js**
- ✅ Fixed duplicate debate route file
- ✅ Applied same `.single()` to `.limit(1)` fix

## 🧪 Testing

### Quick Test
```bash
# Test the Supabase query fix
./test-supabase-fix.sh
```

### Manual Testing
```bash
# Test with your specific dilemma ID
curl -X POST http://localhost:3001/api/debate/6da7d635-1e26-4df3-be60-240809cfe036/respond \
  -H "Content-Type: application/json" \
  -d '{"dummy": "data"}'
```

## 📊 Before vs After

### Before (Broken)
```javascript
const { data: dilemmaData, error } = await supabase
  .from("Dilemmas")
  .select("prompt, id")
  .eq("id", dilemmaId.toString())
  .single(); // ❌ Causes PGRST116 error
```

### After (Fixed)
```javascript
const { data: dilemmaDataArray, error } = await supabase
  .from("Dilemmas")
  .select("prompt, id")
  .eq("id", dilemmaId.toString())
  .limit(1); // ✅ Returns array safely

const dilemmaData = dilemmaDataArray?.[0]; // ✅ Extract first item
```

## 🔍 Console Logs to Watch For

When working correctly, you should see:
```
Looking for dilemma with ID: 6da7d635-1e26-4df3-be60-240809cfe036
Supabase query result: { data: [{ prompt: "...", id: "..." }], error: null }
Found dilemma: { prompt: "...", id: "..." }
```

## 🚨 Files That Were NOT Changed

- **backend/routes/dilemma.js**: Kept `.single()` because it's used after an insert operation, which is correct

## 🚀 Next Steps

1. Test with the provided script
2. Verify the specific dilemma ID works: `6da7d635-1e26-4df3-be60-240809cfe036`
3. Check console logs for successful query results
4. No more PGRST116 errors should occur

The Supabase queries should now work reliably without throwing the "multiple rows" error! 