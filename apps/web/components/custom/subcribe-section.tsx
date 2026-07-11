import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SubcribeSection() {
    return (
        <div className="container relative xl:max-w-(--breakpoint-xl)">
            <div className="rounded-2xl bg-[url(/images/call-action.png)] bg-cover bg-center px-5 py-16 lg:px-24 lg:py-20">
                <span className="absolute inset-0 bg-linear-to-r from-primary/90 to-primary/20"></span>
                <div className="relative mb-14">
                    <h2 className="mb-3 max-w-xl text-[26px]/8 font-semibold sm:text-3xl lg:mb-5 lg:text-5xl/[60px]">
                        Unlock the Power of AI for
                        <span className="bg-linear-to-l from-green-100 to-green-light bg-clip-text text-transparent">
                            &nbsp;Your Business Today
                        </span>
                    </h2>
                    <p className="max-w-xl text-gray">
                        Unlock the power of AI to streamline operations, boost
                        productivity, and fuel innovation, transforming your
                        business for the future.
                    </p>
                </div>
                <div className="flex max-w-md">
                    <Input
                        type="text"
                        className="py-2.5 w-full"
                        placeholder="Enter your email address"
                    />
                    <Button type="button">
                        Subscribe
                    </Button>
                </div>
            </div>
        </div>
    )
}
