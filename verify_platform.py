import asyncio
import argparse
from playwright.async_api import async_playwright

async def verify_instance(instance_id: int):
    print(f"[{instance_id}] Starting verification...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(err.message))
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

        try:
            print(f"[{instance_id}] Navigating to http://localhost:4000...")
            # Wait until network is mostly idle to ensure full load
            await page.goto("http://localhost:4000", wait_until="networkidle", timeout=15000)
            
            # Check for the React Three Fiber Canvas element
            print(f"[{instance_id}] Checking for Canvas element...")
            await page.wait_for_selector("canvas", timeout=10000)
            
            # Wait a few seconds to observe stability and WebSocket connections
            print(f"[{instance_id}] Simulating user session for 5 seconds...")
            await asyncio.sleep(5)
            
            if errors:
                print(f"[{instance_id}] ❌ Verification failed. Caught {len(errors)} errors:")
                for err in errors:
                    print(f"[{instance_id}]    - {err}")
                return False
                
            print(f"[{instance_id}] ✅ Verification passed successfully. No console errors.")
            return True
            
        except Exception as e:
            print(f"[{instance_id}] ❌ Verification failed with exception: {e}")
            return False
        finally:
            await browser.close()

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--concurrent", type=int, default=1, help="Number of concurrent instances to run")
    args = parser.parse_args()

    print(f"Starting E2E verification with {args.concurrent} concurrent instances...")
    
    tasks = [verify_instance(i+1) for i in range(args.concurrent)]
    results = await asyncio.gather(*tasks)
    
    if all(results):
        print("\n🎉 All verifications passed successfully!")
        exit(0)
    else:
        failed = results.count(False)
        print(f"\n💥 {failed} out of {args.concurrent} verifications failed.")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())
