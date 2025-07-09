import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // This function will only run on the client side
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const handleResize = () => {
      setIsMobile(mql.matches)
    }
    
    // Set the initial value
    handleResize()
    
    mql.addEventListener("change", handleResize)
    
    return () => mql.removeEventListener("change", handleResize)
  }, [])

  return isMobile
}
